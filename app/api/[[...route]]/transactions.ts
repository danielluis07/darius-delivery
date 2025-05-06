import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import {
  orders,
  products,
  transactions,
  users,
  orderItems,
  stores,
} from "@/db/schema";
import { and, eq, sum } from "drizzle-orm";

const app = new Hono()
  .get(
    "/store/:storeId",
    zValidator("param", z.object({ storeId: z.string().optional() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      if (!storeId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const data = await db
        .select({
          transactionId: transactions.id,
          orderId: orders.id,
          buyerId: users.id,
          buyerName: users.name,
          buyerEmail: users.email,
          totalPrice: orders.total_price,
          productId: products.id,
          productName: products.name,
          productPrice: products.price,
          transactionAmount: transactions.amount,
          transactionStatus: transactions.status,
          transactionType: transactions.type,
          transactionCreatedAt: transactions.createdAt,
        })
        .from(transactions)
        .innerJoin(orders, eq(transactions.order_id, orders.id))
        .innerJoin(stores, eq(stores.id, storeId))
        .innerJoin(users, eq(users.id, stores.userId))
        .innerJoin(orderItems, eq(orders.id, orderItems.order_id))
        .innerJoin(products, eq(orderItems.product_id, products.id))
        .where(eq(transactions.storeId, storeId));

      if (!data || data.length === 0) {
        return c.json({ error: "No transactions found found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/totalrevenue/store/:storeId",
    zValidator("param", z.object({ storeId: z.string().optional() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      if (!storeId) {
        return c.json({ error: "Missing user id" }, 400);
      }
      const [totalSalesValue] = await db
        .select({
          totalRevenue: sum(transactions.amount),
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.storeId, storeId),
            eq(transactions.status, "COMPLETED")
          )
        );

      return c.json({ data: totalSalesValue.totalRevenue });
    }
  );

export default app;
