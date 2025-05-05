import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import {
  additionalGroups,
  additionals,
  categories,
  categoryAdditionalGroups,
  products,
} from "@/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { deleteFromS3 } from "@/lib/s3-upload";

interface Additional {
  id: string;
  name: string;
  priceAdjustment: number;
}

interface AdditionalGroup {
  id: string;
  name: string;
  selectionType: "single" | "multiple";
  isRequired: boolean;
  additionals: Additional[];
}

interface ProductWithAdditionals {
  id: string;
  name: string;
  allowHalfOption: boolean;
  storeId: string | null;
  image: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  category_id: string | null | undefined;
  description: string | null;
  type: string;
  price: number;
  sizes: string[] | null;
  additionalGroups: AdditionalGroup[];
}

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
    "/user/:storeId",
    zValidator("param", z.object({ storeId: z.string().optional() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      if (!storeId) {
        return c.json({ error: "Missing store id" }, 400);
      }

      const data = await db
        .select()
        .from(products)
        .where(eq(products.storeId, storeId));

      if (!data || data.length === 0) {
        return c.json({ error: "No products found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/customer/:storeId/:categoryId",
    zValidator(
      "param",
      z.object({
        storeId: z.string().optional(),
        categoryId: z.string().optional(),
      })
    ),
    async (c) => {
      const { storeId, categoryId } = c.req.valid("param");

      if (!storeId || !categoryId) {
        return c.json({ error: "Missing storeId or categoryId" }, 400);
      }

      try {
        const data = await db
          .select({
            product: products,
            additionalGroup: additionalGroups,
            additional: additionals,
          })
          .from(products)
          .innerJoin(categories, eq(products.category_id, categories.id))
          .leftJoin(
            categoryAdditionalGroups,
            eq(categories.id, categoryAdditionalGroups.categoryId)
          )
          .leftJoin(
            additionalGroups,
            eq(additionalGroups.id, categoryAdditionalGroups.additionalGroupId)
          )
          .leftJoin(
            additionals,
            eq(additionals.additionalGroupId, additionalGroups.id)
          )
          .where(
            and(
              eq(products.storeId, storeId),
              eq(products.category_id, categoryId),
              eq(categories.storeId, storeId), // Ensure category belongs to user
              eq(products.isActive, true) // Ensure product is active
            )
          );

        if (!data || data.length === 0) {
          return c.json({ error: "No products found" }, 404);
        }

        const productMap = new Map<string, ProductWithAdditionals>();

        for (const item of data) {
          const productId = item.product.id;

          if (!productMap.has(productId)) {
            productMap.set(productId, {
              ...item.product,
              additionalGroups: [],
            });
          }

          const product = productMap.get(productId)!;

          if (item.additionalGroup && item.additionalGroup.id) {
            let group = product.additionalGroups.find(
              (g) => g.id === item.additionalGroup?.id
            );

            if (!group) {
              group = {
                ...item.additionalGroup,
                additionals: [],
              };
              product.additionalGroups.push(group);
            }

            if (item.additional && item.additional.id) {
              if (
                !group.additionals.some((a) => a.id === item.additional?.id)
              ) {
                group.additionals.push(item.additional);
              }
            }
          }
        }

        const finalResult: ProductWithAdditionals[] = Array.from(
          productMap.values()
        );

        return c.json({ data: finalResult }, 200);
      } catch (error) {
        console.error("Error fetching products with additionals:", error);
        return c.json({ error: "Failed to fetch products" }, 500);
      }
    }
  )
  .get(
    "/count/:storeId",
    zValidator("param", z.object({ storeId: z.string() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      if (!storeId) {
        return c.json({ error: "Missing user ID" }, 400);
      }

      const [data] = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.storeId, storeId));

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
        .update(products)
        .set({ isActive })
        .where(eq(products.id, id));

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
