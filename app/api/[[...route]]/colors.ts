import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { colors } from "@/db/schema";
import { insertColorsSchema } from "@/db/schemas";
import { and, eq } from "drizzle-orm";
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
    "/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const [data] = await db
        .select()
        .from(colors)
        .where(eq(colors.user_id, userId));

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

      const data = await db
        .insert(colors)
        .values({ ...values, user_id: auth.token.sub });

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

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!values) {
        return c.json({ error: "Missing data" }, 400);
      }

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const data = await db
        .update(colors)
        .set(values)
        .where(and(eq(colors.id, id), eq(colors.user_id, auth.token.sub)));

      if (!data) {
        return c.json({ error: "Failed to update data" }, 500);
      }

      return c.json({ data });
    }
  );

export default app;
