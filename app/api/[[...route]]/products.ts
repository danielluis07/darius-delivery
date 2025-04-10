import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { deleteFromS3 } from "@/lib/s3-upload";

const app = new Hono()
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing product id" }, 400);
      }

      const [data] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));

      if (!data) {
        return c.json({ error: "No product found" }, 404);
      }

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
        .from(products)
        .where(eq(products.userId, userId));

      if (!data || data.length === 0) {
        return c.json({ error: "No products found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/customer/:userId/:categoryId",
    zValidator(
      "param",
      z.object({
        userId: z.string().optional(),
        categoryId: z.string().optional(),
      })
    ),
    async (c) => {
      const { userId, categoryId } = c.req.valid("param");

      if (!userId || !categoryId) {
        return c.json({ error: "Missing userId or categoryId" }, 400);
      }

      const data = await db
        .select()
        .from(products)
        .where(
          and(eq(products.userId, userId), eq(products.category_id, categoryId))
        );

      if (!data || data.length === 0) {
        return c.json({ error: "No products found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/count/:userId",
    zValidator("param", z.object({ userId: z.string() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user ID" }, 400);
      }

      const [data] = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.userId, userId));

      if (!data) {
        return c.json({ error: "No orders found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    "/delete-products",
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (c) => {
      const values = c.req.valid("json");

      const data = await db
        .delete(products)
        .where(inArray(products.id, values.ids));

      if (!data) {
        return c.json({ error: "Failed to delete products" }, 500);
      }

      return c.json({ data });
    }
  )
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
          image: products.image,
        })
        .from(products)
        .where(inArray(products.id, values.ids));

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
        .delete(products)
        .where(inArray(products.id, values.ids));

      if (!data) {
        return c.json({ error: "Falha ao deletar produtos" }, 500);
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
          image: products.image,
        })
        .from(products)
        .where(eq(products.id, id));

      if (!existingImage || !existingImage.image) {
        console.error("Failed to fetch image");
        return c.json({ error: "Falha ao deletar o produto" }, 500);
      }

      const fileName = existingImage.image.split("/").pop() || "";

      const { success, message } = await deleteFromS3(fileName);
      if (!success) {
        console.error(`Falha ao deletar ${fileName}: ${message}`);
        return c.json({ error: message }, 500);
      }

      const data = await db.delete(products).where(eq(products.id, id));

      if (!data) {
        console.error("Failed to delete product");
        return c.json({ error: "Falha ao deletar o produto" }, 500);
      }

      return c.json({ data });
    }
  );

export default app;
