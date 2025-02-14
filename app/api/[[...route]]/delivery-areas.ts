import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { deliveryAreas } from "@/db/schema";
import { insertDeliveryAreasSchema } from "@/db/schemas";
import { eq, inArray } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";

const app = new Hono()
  .get(
    "/user/:userId",
    verifyAuth(),
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");
      const auth = c.get("authUser");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const data = await db
        .select()
        .from(deliveryAreas)
        .where(eq(deliveryAreas.user_id, userId));

      if (!data || data.length === 0) {
        return c.json({ error: "No delivery areas found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    "/",
    verifyAuth(),
    zValidator("json", insertDeliveryAreasSchema),
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
        .insert(deliveryAreas)
        .values({ ...values, user_id: auth.token.sub });

      if (!data) {
        return c.json({ error: "Failed to insert data" }, 500);
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

      const data = await db
        .delete(deliveryAreas)
        .where(inArray(deliveryAreas.id, values.ids));

      if (!data) {
        return c.json({ error: "Failed to delete delivery areas" }, 500);
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

      const data = await db
        .delete(deliveryAreas)
        .where(eq(deliveryAreas.id, id));

      if (!data) {
        return c.json({ error: "Failed to delete delivery area" }, 500);
      }

      return c.json({ data });
    }
  );
export default app;
