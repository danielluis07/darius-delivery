import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { deliverers, orders } from "@/db/schema";
import { insertDeliverersSchema } from "@/db/schemas";
import { eq, inArray, sql } from "drizzle-orm";
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

      // Fetch deliverers with their assigned order count
      const data = await db
        .select({
          id: deliverers.id,
          name: deliverers.name,
          phone: deliverers.phone,
          vehicle: deliverers.vehicle,
          vehicle_plate: deliverers.vehicle_plate,
          createdAt: deliverers.createdAt,
          updatedAt: deliverers.updatedAt,
          order_count: sql<number>`COUNT(${orders.id})`.as("order_count"),
        })
        .from(deliverers)
        .leftJoin(orders, eq(deliverers.id, orders.delivererId))
        .where(eq(deliverers.user_id, userId))
        .groupBy(deliverers.id);

      if (!data || data.length === 0) {
        return c.json({ error: "No deliverers found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    "/",
    verifyAuth(),
    zValidator("json", insertDeliverersSchema),
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
        .insert(deliverers)
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
        .delete(deliverers)
        .where(inArray(deliverers.id, values.ids));

      if (!data) {
        return c.json({ error: "Failed to delete deliverers" }, 500);
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

      const data = await db.delete(deliverers).where(eq(deliverers.id, id));

      if (!data) {
        return c.json({ error: "Failed to delete deliverer" }, 500);
      }

      return c.json({ data });
    }
  );
export default app;
