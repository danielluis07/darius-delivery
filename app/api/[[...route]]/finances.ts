import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { orders, transactions } from "@/db/schema";
import { eq, sum, and } from "drizzle-orm";

const app = new Hono().get(
  "/totalrevenue/:userId",
  zValidator("param", z.object({ userId: z.string().optional() })),
  async (c) => {
    const { userId } = c.req.valid("param");

    if (!userId) {
      return c.json({ error: "Missing user id" }, 400);
    }

    // Sum the transaction amounts for completed orders belonging to the user
    const [revenue] = await db
      .select({ totalRevenue: sum(transactions.amount) })
      .from(transactions)
      .innerJoin(orders, eq(transactions.order_id, orders.id))
      .where(
        and(
          eq(orders.user_id, userId),
          eq(transactions.status, "COMPLETED") // Ensure we're only counting completed transactions
        )
      );

    return c.json({ data: revenue.totalRevenue });
  }
);

export default app;
