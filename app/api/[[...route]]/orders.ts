import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { orders, orderItems, products, customers, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

const app = new Hono()
  .get(
    "/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const data = await db
        .select()
        .from(orders)
        .where(eq(orders.user_id, userId))
        .orderBy(desc(orders.createdAt));

      if (!data || data.length === 0) {
        return c.json({ error: "No orders found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/:orderId",
    zValidator("param", z.object({ orderId: z.string().optional() })),
    async (c) => {
      const { orderId } = c.req.valid("param");

      if (!orderId) {
        return c.json({ error: "Missing order id" }, 400);
      }

      const [data] = await db
        .select({
          order: {
            id: orders.id,
            createdAt: orders.createdAt,
            totalPrice: orders.total_price,
            status: orders.status,
          },
          item: {
            id: orderItems.id,
            quantity: orderItems.quantity,
            price: orderItems.price,
          },
          product: {
            id: products.id,
            name: products.name,
            description: products.description,
          },
          customer: {
            id: customers.userId,
            name: users.name,
            email: users.email,
            address: customers.address,
            phone: users.phone,
            city: customers.city,
            state: customers.state,
            neighborhood: customers.neighborhood,
          },
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.order_id))
        .innerJoin(users, eq(orders.customer_id, users.id))
        .leftJoin(products, eq(orderItems.product_id, products.id))
        .leftJoin(customers, eq(orders.customer_id, customers.userId))
        .where(eq(orders.id, orderId));

      if (!data) {
        return c.json({ error: "Order not found" }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
