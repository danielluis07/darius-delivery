import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { users, subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";

const app = new Hono()
  .get("/users", async (c) => {
    const data = await db.select().from(users).where(eq(users.role, "USER"));

    if (!data || data.length === 0) {
      return c.json({ error: "No users found" }, 404);
    }

    return c.json({ data });
  })
  .get("/users/active", async (c) => {
    const data = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, "USER"),
          eq(users.isActive, true),
          eq(users.isSubscribed, true)
        )
      );

    if (!data || data.length === 0) {
      return c.json({ error: "No users found" }, 404);
    }

    return c.json({ data });
  })
  .get("/subscriptions", async (c) => {
    const [data] = await db
      .select()
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.user_id, users.id));

    if (!data) {
      return c.json({ error: "No subscriptions found" }, 404);
    }

    return c.json({ data });
  })
  .patch(
    "/userstatus/:userId",
    verifyAuth(),
    zValidator("param", z.object({ userId: z.string().optional() })),
    zValidator("json", z.object({ isActive: z.boolean() })),
    async (c) => {
      const { userId } = c.req.valid("param");
      const { isActive } = c.req.valid("json");

      if (!userId) {
        return c.json({ error: "User ID is missing" }, 400);
      }

      const data = await db
        .update(users)
        .set({
          isActive,
        })
        .where(eq(users.id, userId));

      if (!data) {
        return c.json({ error: "Failed to update user status" }, 500);
      }

      return c.json({ data });
    }
  )
  .patch(
    "/usercomission/:userId",
    verifyAuth(),
    zValidator("param", z.object({ userId: z.string().optional() })),
    zValidator("json", z.object({ comission: z.string() })),
    async (c) => {
      const { userId } = c.req.valid("param");
      const { comission } = c.req.valid("json");

      if (!userId) {
        return c.json({ error: "User ID is missing" }, 400);
      }

      const data = await db
        .update(users)
        .set({
          comissionPercentage: comission,
        })
        .where(eq(users.id, userId));

      if (!data) {
        return c.json({ error: "Failed to update user comission" }, 500);
      }

      return c.json({ data });
    }
  );

export default app;
