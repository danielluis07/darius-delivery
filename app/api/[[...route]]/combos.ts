import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { combos } from "@/db/schema";
import { insertComboSchema } from "@/db/schemas";
import { eq, inArray } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";

const app = new Hono()
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

      const data = await db
        .delete(combos)
        .where(inArray(combos.id, values.ids));

      if (!data) {
        return c.json({ error: "Failed to delete combos" }, 500);
      }

      return c.json({ data });
    }
  )
  .delete(
    "/:id",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const data = await db.delete(combos).where(eq(combos.id, id));

      if (!data) {
        return c.json({ error: "Failed to delete deliverer" }, 500);
      }

      return c.json({ data });
    }
  );
export default app;
