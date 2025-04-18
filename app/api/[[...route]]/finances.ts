import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { orders, transactions } from "@/db/schema";
import { eq, sum, and, sql, count } from "drizzle-orm";

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
  )
  .get(
    "/monthlyorders/:userId/:year",
    zValidator(
      "param",
      z.object({
        userId: z.string(),
        year: z.string().regex(/^\d{4}$/), // Apenas 4 dígitos (ano)
      })
    ),
    async (c) => {
      const { userId, year } = c.req.valid("param");

      // Contar o número de pedidos por mês no ano especificado
      const ordersPerMonth = await db
        .select({
          month: sql`TO_CHAR(${orders.createdAt}, 'MM')`.as("month"),
          totalOrders: count(),
        })
        .from(orders)
        .where(
          and(
            eq(orders.user_id, userId),
            sql`TO_CHAR(${orders.createdAt}, 'YYYY') = ${year}`
          )
        )
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'MM')`)
        .orderBy(sql`TO_CHAR(${orders.createdAt}, 'MM')`);

      return c.json({ data: ordersPerMonth });
    }
  )
  .get(
    "/average-ticket/:userId",
    zValidator("param", z.object({ userId: z.string() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      // Buscar o faturamento total do usuário
      const [revenue] = await db
        .select({
          totalRevenue: sum(transactions.amount).as("totalRevenue"),
        })
        .from(transactions)
        .innerJoin(orders, eq(transactions.order_id, orders.id))
        .where(
          and(
            eq(orders.user_id, userId),
            eq(transactions.status, "COMPLETED") // Apenas pedidos finalizados
          )
        );

      // Contar o número de pedidos finalizados do usuário
      const [orderCount] = await db
        .select({
          totalOrders: count().as("totalOrders"),
        })
        .from(orders)
        .where(eq(orders.user_id, userId));

      // Forçar os valores para garantir que sejam números
      const totalRevenue: number = Number(revenue?.totalRevenue) || 0;
      const totalOrders: number = Number(orderCount?.totalOrders) || 0;
      const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return c.json({
        data: Math.round(averageTicket), // Formata para 2 casas decimais
      });
    }
  );

export default app;
