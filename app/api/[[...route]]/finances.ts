import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { orders, transactions } from "@/db/schema";
import { eq, sum, and, sql } from "drizzle-orm";

const app = new Hono()
  .get(
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
  )
  .get(
    "/monthlyrevenue/:userId/:year",
    zValidator(
      "param",
      z.object({
        userId: z.string(),
        year: z.string().regex(/^\d{4}$/), // Ano no formato YYYY
      })
    ),
    async (c) => {
      const { userId, year } = c.req.valid("param");

      // Buscar receita total agrupada por mês para o ano específico
      const revenuePerMonth = await db
        .select({
          month: sql`TO_CHAR(${transactions.createdAt}, 'MM')`.as("month"),
          total: sum(transactions.amount),
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.user_id, userId), // Filtrar pelo usuário correto
            eq(transactions.status, "COMPLETED"), // Somente transações concluídas
            sql`TO_CHAR(${transactions.createdAt}, 'YYYY') = ${year}` // Filtrar pelo ano escolhido
          )
        )
        .groupBy(sql`TO_CHAR(${transactions.createdAt}, 'MM')`)
        .orderBy(sql`TO_CHAR(${transactions.createdAt}, 'MM')`);

      return c.json({ data: revenuePerMonth });
    }
  );

export default app;
