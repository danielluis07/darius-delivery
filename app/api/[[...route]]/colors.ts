import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { colors } from "@/db/schema";
import { insertColorsSchema } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";

const app = new Hono()
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db.select().from(colors).where(eq(colors.id, id));

      if (!data) {
        return c.json({ error: "No color found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/store/:storeId",
    zValidator("param", z.object({ storeId: z.string().optional() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      if (!storeId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const [data] = await db
        .select()
        .from(colors)
        .where(eq(colors.storeId, storeId));

      if (!data) {
        return c.json({ error: "No colors found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    "/",
    verifyAuth(),
    zValidator("json", insertColorsSchema),
    async (c) => {
      const auth = c.get("authUser");
      const values = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!values) {
        return c.json({ error: "Missing data" }, 400);
      }

      const data = await db.insert(colors).values(values);

      if (!data) {
        return c.json({ error: "Failed to insert data" }, 500);
      }

      return c.json({ data });
    }
  )
  .patch(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", insertColorsSchema),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      console.log("values", values);

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!values) {
        return c.json({ error: "Missing data" }, 400);
      }

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const data = await db.update(colors).set(values).where(eq(colors.id, id));

      if (!data) {
        return c.json({ error: "Failed to update data" }, 500);
      }

      return c.json({ data });
    }
  );

export default app;
