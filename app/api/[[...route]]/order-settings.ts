import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { orderSettings } from "@/db/schema";
import { insertOrderSettingsSchema } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { ExtendedAuthUser } from "@/types";

const app = new Hono()
  .get(
    "/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const [data] = await db
        .select({
          id: orderSettings.id,
          delivery_deadline: orderSettings.delivery_deadline,
          pickup_deadline: orderSettings.pickup_deadline,
        })
        .from(orderSettings)
        .where(eq(orderSettings.user_id, userId));

      if (!data) {
        return c.json({ error: "No order settings found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    "/",
    verifyAuth(),
    zValidator("json", insertOrderSettingsSchema),
    async (c) => {
      const auth = c.get("authUser") as ExtendedAuthUser;
      const { delivery_deadline, pickup_deadline } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const id =
        auth.token.role === "EMPLOYEE"
          ? auth.token.restaurantOwnerId
          : auth.token.sub;

      if (!delivery_deadline || !pickup_deadline) {
        return c.json({ error: "Missing data" }, 400);
      }

      const data = await db.insert(orderSettings).values({
        user_id: id,
        delivery_deadline,
        pickup_deadline,
      });

      if (!data) {
        return c.json({ error: "Failed to insert order settings" }, 500);
      }

      return c.json({ data });
    }
  )
  .patch(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", insertOrderSettingsSchema),
    async (c) => {
      const auth = c.get("authUser") as ExtendedAuthUser;
      const { id } = c.req.valid("param");
      const { delivery_deadline, pickup_deadline } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const userId =
        auth.token.role === "EMPLOYEE"
          ? auth.token.restaurantOwnerId
          : auth.token.sub;

      if (!id || !userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const data = await db
        .update(orderSettings)
        .set({
          delivery_deadline,
          pickup_deadline,
        })
        .where(eq(orderSettings.id, userId));

      if (!data) {
        return c.json({ error: "Failed to update order settings" }, 500);
      }

      return c.json({ data });
    }
  );

export default app;
