import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import {
  receipts,
  users,
  orders,
  orderItems,
  products,
  customers,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { alias } from "drizzle-orm/pg-core";

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

const app = new Hono().get(
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

    const customersUser = alias(users, "customersUser");

    const data = await db
      .select({
        id: receipts.id,
        number: receipts.receipt_number,
        orderNumber: orders.number,
        createdAt: receipts.createdAt,
        customerName: customersUser.name, // Get the actual customer name
        customerEmail: customersUser.email,
        customerPhone: customersUser.phone,
        customerId: customers.id,
        customerCity: customers.city,
        customerState: customers.state,
        customerNeighborhood: customers.neighborhood,
        customerAddress: customers.address,
        orderTotalPrice: orders.total_price,
        orderPaymentType: orders.payment_type,
        orderPaymentStatus: orders.payment_status,
        orderStatus: orders.status,
        orderItems: sql<OrderItem[]>`json_agg(json_build_object(
          'id', ${orderItems.id}, 
          'productName', ${products.name}, 
          'quantity', ${orderItems.quantity}, 
          'price', ${orderItems.price}
      ))`.as("orderItems"),
      })
      .from(receipts)
      .leftJoin(users, eq(receipts.user_id, users.id)) // This is likely the restaurant owner
      .leftJoin(orders, eq(receipts.order_id, orders.id))
      .leftJoin(customers, eq(orders.customer_id, customers.userId))
      .leftJoin(customersUser, eq(customers.userId, customersUser.id)) // Join actual customer user info
      .leftJoin(orderItems, eq(orders.id, orderItems.order_id))
      .leftJoin(products, eq(orderItems.product_id, products.id))
      .where(eq(users.id, userId))
      .groupBy(
        receipts.id,
        customersUser.name, // Make sure to group by the correct user alias
        customersUser.email,
        customersUser.phone,
        orders.total_price,
        orders.payment_type,
        orders.payment_status,
        orders.status,
        orders.number,
        customers.id,
        customers.city,
        customers.state,
        customers.neighborhood,
        customers.address
      );

    if (!data || data.length === 0) {
      return c.json({ error: "No deliverers found" }, 404);
    }

    return c.json({ data });
  }
);
export default app;
