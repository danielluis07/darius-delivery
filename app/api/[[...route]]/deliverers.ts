import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { deliverers, orders } from "@/db/schema";
import { insertDeliverersSchema } from "@/db/schemas";
import { eq, inArray, sql } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { ExtendedAuthUser } from "@/types";

const app = new Hono()
  .get(
    "/store/:storeId",
    verifyAuth(),
    zValidator("param", z.object({ storeId: z.string().optional() })),
    async (c) => {
      const { storeId } = c.req.valid("param");
      const auth = c.get("authUser");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!storeId) {
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
        .where(eq(deliverers.storeId, storeId))
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
      const auth = c.get("authUser") as ExtendedAuthUser;
      const values = c.req.valid("json");

      if (!auth || !auth.token) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!values) {
        return c.json({ error: "Missing data" }, 400);
      }

      const data = await db.insert(deliverers).values(values);

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
  .patch(
    "/:id",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator("json", insertDeliverersSchema),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      if (!values) {
        return c.json({ error: "Missing data" }, 400);
      }

      const data = await db
        .update(deliverers)
        .set(values)
        .where(eq(deliverers.id, id));

      if (!data) {
        return c.json({ error: "Failed to update deliverer" }, 500);
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
