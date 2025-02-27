import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { products } from "@/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";

const app = new Hono()
  .get(
    "/:userId",
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

      const data = await db.delete(products).where(eq(products.id, id));

      if (!data) {
        return c.json({ error: "Failed to delete product" }, 500);
      }

      return c.json({ data });
    }
  );

export default app;
