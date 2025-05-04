import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { comboProducts, combos, products } from "@/db/schema";
import { insertComboSchema } from "@/db/schemas";
import { and, eq, inArray } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { deleteFromS3 } from "@/lib/s3-upload";
import { Combo } from "@/types";

const app = new Hono()
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string() })), // Made id required as it's checked
    async (c) => {
      const { id } = c.req.valid("param");

      // 1. Fetch the main combo data
      const [comboData] = await db
        .select({
          id: combos.id,
          name: combos.name,
          image: combos.image,
          description: combos.description,
          price: combos.price,
          // Don't include product_ids here yet
        })
        .from(combos)
        .where(eq(combos.id, id));

      if (!comboData) {
        return c.json({ error: "No combo found" }, 404);
      }

      // 2. Fetch the associated product IDs
      const productLinks = await db
        .select({
          product_id: comboProducts.product_id,
        })
        .from(comboProducts)
        .where(eq(comboProducts.combo_id, id)); // Filter by the combo id

      // 3. Extract just the IDs into an array of strings
      const productIds = productLinks.map((link) => link.product_id);

      // 4. Combine the data
      const data = {
        ...comboData,
        product_ids: productIds, // Add the array of product IDs
      };

      return c.json({ data });
    }
  )
  .get(
    "/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const data = await db
        .select()
        .from(combos)
        .where(eq(combos.userId, userId));

      if (!data || data.length === 0) {
        return c.json({ error: "No combos found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/template/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const combosWithProducts = await db
        .select({
          comboId: combos.id,
          name: combos.name,
          image: combos.image,
          userId: combos.userId,
          description: combos.description,
          price: combos.price,
          isActive: combos.isActive,
          type: combos.type,
          productId: products.id,
          productName: products.name,
          productImage: products.image,
          productPrice: products.price,
          createdAt: combos.createdAt,
          updatedAt: combos.updatedAt,
        })
        .from(combos)
        .leftJoin(comboProducts, eq(combos.id, comboProducts.combo_id))
        .leftJoin(products, eq(comboProducts.product_id, products.id))
        .where(and(eq(combos.userId, userId), eq(combos.isActive, true)));

      // Group by comboId
      const grouped = new Map();

      for (const row of combosWithProducts) {
        if (!grouped.has(row.comboId)) {
          grouped.set(row.comboId, {
            id: row.comboId,
            name: row.name,
            image: row.image,
            description: row.description,
            price: row.price,
            isActive: row.isActive,
            type: row.type,
            products: [],
          });
        }

        if (row.productId) {
          grouped.get(row.comboId).products.push({
            id: row.productId,
            name: row.productName,
            image: row.productImage,
            price: row.productPrice,
          });
        }
      }

      const result: Combo[] = Array.from(grouped.values());

      if (result.length === 0) {
        return c.json({ error: "No combos found" }, 404);
      }

      return c.json({ data: result });
    }
  )
  .post("/", verifyAuth(), zValidator("json", insertComboSchema), async (c) => {
    const auth = c.get("authUser");
    const values = c.req.valid("json");

    if (!auth || !auth.token?.sub) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!values) {
      return c.json({ error: "Missing data" }, 400);
    }

    const data = await db
      .insert(combos)
      .values({ ...values, userId: auth.token.sub });

    if (!data) {
      return c.json({ error: "Failed to insert data" }, 500);
    }

    return c.json({ data });
  })
  .post(
    "/delete",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const values = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const uploadedFiles: string[] = [];

      const existingImages = await db
        .select({
          image: combos.image,
        })
        .from(combos)
        .where(inArray(combos.id, values.ids));

      if (!existingImages || existingImages.length === 0) {
        return c.json({ error: "Failed to fetch images" }, 500);
      }

      for (const image of existingImages) {
        if (image.image) {
          const imageName = image.image.split("/").pop() || "";
          uploadedFiles.push(imageName);
        }
      }

      for (const fileName of uploadedFiles) {
        const { success, message } = await deleteFromS3(fileName);
        if (!success) {
          console.error(`Falha ao deletar ${fileName}: ${message}`);
          return c.json({ error: message }, 500);
        }
      }

      const data = await db
        .delete(combos)
        .where(inArray(combos.id, values.ids));

      if (!data) {
        return c.json({ error: "Falha ao deletar os combos" }, 500);
      }

      return c.json({ data });
    }
  )
  .patch(
    "/activate/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator(
      "json",
      z.object({
        isActive: z.boolean(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");
      const { isActive } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!id) {
        return c.json({ error: "Missing product id" }, 400);
      }

      const data = await db
        .update(combos)
        .set({ isActive })
        .where(and(eq(combos.id, id), eq(combos.userId, auth.token.sub)));

      if (!data) {
        return c.json({ error: "Failed to update product" }, 500);
      }

      return c.json({ data });
    }
  )
  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [existingImage] = await db
        .select({
          image: combos.image,
        })
        .from(combos)
        .where(eq(combos.id, id));

      if (!existingImage || !existingImage.image) {
        console.error("Failed to fetch image");
        return c.json({ error: "Falha ao deletar o combo" }, 500);
      }

      const fileName = existingImage.image.split("/").pop() || "";

      const { success, message } = await deleteFromS3(fileName);
      if (!success) {
        console.error(`Falha ao deletar ${fileName}: ${message}`);
        return c.json({ error: message }, 500);
      }

      const data = await db.delete(combos).where(eq(combos.id, id));

      if (!data) {
        console.error("Failed to delete product");
        return c.json({ error: "Falha ao deletar o produto" }, 500);
      }

      return c.json({ data });
    }
  );
export default app;
