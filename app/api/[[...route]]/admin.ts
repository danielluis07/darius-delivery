import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { users, subscriptions, affiliates } from "@/db/schema";
import { eq, and, sql, count } from "drizzle-orm";
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
    const data = await db
      .select({
        id: subscriptions.id,
        userId: subscriptions.user_id,
        name: users.name,
        email: users.email,
        status: subscriptions.status,
        plan: subscriptions.plan,
        isTrial: users.isTrial,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .leftJoin(users, eq(subscriptions.user_id, users.id));

    if (!data || data.length === 0) {
      return c.json({ error: "No subscriptions found" }, 404);
    }

    return c.json({ data });
  })
  .get(
    "/monthlysubs/:year",
    zValidator(
      "param",
      z.object({
        year: z.string().regex(/^\d{4}$/), // Apenas 4 dígitos (ano)
      })
    ),
    async (c) => {
      const { year } = c.req.valid("param");

      // Contar o número de pedidos por mês no ano especificado
      const subsPerMonth = await db
        .select({
          month: sql`TO_CHAR(${subscriptions.createdAt}, 'MM')`.as("month"),
          totalsubs: count(),
        })
        .from(subscriptions)
        .where(sql`TO_CHAR(${subscriptions.createdAt}, 'YYYY') = ${year}`)
        .groupBy(sql`TO_CHAR(${subscriptions.createdAt}, 'MM')`)
        .orderBy(sql`TO_CHAR(${subscriptions.createdAt}, 'MM')`);

      return c.json({ data: subsPerMonth });
    }
  )
  .get("/affiliates", async (c) => {
    const data = await db
      .select({
        id: users.id,
        affiliateId: affiliates.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(affiliates, eq(affiliates.user_id, users.id));

    if (!data || data.length === 0) {
      return c.json({ error: "No affiliates found" }, 404);
    }

    return c.json({ data });
  })
  .get(
    "/affiliates/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Affiliate ID is missing" }, 400);
      }

      const [data] = await db
        .select({
          id: users.id,
          affiliateId: affiliates.id,
          referralCode: affiliates.referral_code,
          name: users.name,
          email: users.email,
          phone: users.phone,
          createdAt: users.createdAt,
        })
        .from(users)
        .innerJoin(affiliates, eq(affiliates.user_id, users.id))
        .where(eq(users.id, userId));

      if (!data) {
        return c.json({ error: "No affiliate found" }, 404);
      }

      return c.json({ data });
    }
  )
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
