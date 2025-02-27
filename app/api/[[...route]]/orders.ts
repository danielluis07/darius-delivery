import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import {
  orders,
  orderItems,
  products,
  customers,
  users,
  deliverers,
  receipts,
} from "@/db/schema";
import { asc, eq, inArray, sql, isNull, and } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { alias } from "drizzle-orm/pg-core";

type Products = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  image: string;
};

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
  price: number;
};

const app = new Hono()
  .get(
    "/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const customersUser = alias(users, "customersUser");

      const data = await db
        .select({
          order: orders,
          receipt: {
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
            customerStreet: customers.street,
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
          },
        })
        .from(orders)
        .leftJoin(receipts, eq(receipts.order_id, orders.id))
        .leftJoin(users, eq(orders.user_id, users.id)) // Ensure correct restaurant owner
        .leftJoin(customers, eq(orders.customer_id, customers.userId))
        .leftJoin(customersUser, eq(customers.userId, customersUser.id)) // Alias for customer users
        .leftJoin(orderItems, eq(orders.id, orderItems.order_id))
        .leftJoin(products, eq(orderItems.product_id, products.id))
        .where(eq(orders.user_id, userId))
        .groupBy(
          orders.id,
          receipts.id,
          receipts.receipt_number,
          receipts.createdAt,
          customers.id,
          customersUser.name,
          customersUser.email,
          customersUser.phone,
          customers.city,
          customers.state,
          customers.neighborhood,
          customers.street
        )
        .orderBy(asc(orders.createdAt));

      if (!data || data.length === 0) {
        return c.json({ error: "No orders found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/routing/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const data = await db
        .select()
        .from(orders)
        .where(and(eq(orders.user_id, userId), isNull(orders.delivererId)))
        .orderBy(asc(orders.createdAt));

      if (!data || data.length === 0) {
        return c.json({ error: "No orders found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/:orderId",
    verifyAuth(),
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
            number: orders.number,
            createdAt: orders.createdAt,
            totalPrice: orders.total_price,
            status: orders.status,
            payment_status: orders.payment_status,
            type: orders.type,
            delivery_deadline: orders.delivery_deadline,
            pickup_deadline: orders.pickup_deadline,
          },
          customer: {
            id: customers.userId,
            name: users.name,
            email: users.email,
            street: customers.street,
            phone: users.phone,
            city: customers.city,
            state: customers.state,
            neighborhood: customers.neighborhood,
          },
          deliverer: {
            id: deliverers.id,
            name: deliverers.name,
            phone: deliverers.phone,
          },
          products: sql<Products[]>`
          COALESCE(
            json_agg(
              json_build_object(
                'id', ${products.id},
                'name', ${products.name},
                'price', ${products.price},
                'quantity', ${orderItems.quantity},
                'description', ${products.description},
                'image', ${products.image}
              )
            ) FILTER (WHERE ${products.id} IS NOT NULL), '[]'
          )
        `.as("products"),
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.order_id))
        .innerJoin(users, eq(orders.customer_id, users.id))
        .leftJoin(deliverers, eq(orders.delivererId, deliverers.id))
        .leftJoin(products, eq(orderItems.product_id, products.id))
        .leftJoin(customers, eq(orders.customer_id, customers.userId))
        .where(eq(orders.id, orderId))
        .groupBy(
          orders.id,
          users.id,
          deliverers.id,
          customers.userId,
          customers.street,
          customers.city,
          customers.state,
          customers.neighborhood
        );

      if (!data) {
        return c.json({ error: "Order not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    "/assignorders",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        ordersIds: z.array(z.string()),
        delivererId: z.string(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { ordersIds, delivererId } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!orders || !delivererId) {
        return c.json({ error: "Missing orders or deliverer id" }, 400);
      }

      const data = await db
        .update(orders)
        .set({ delivererId: delivererId, updatedAt: new Date() })
        .where(inArray(orders.id, ordersIds));

      if (!data) {
        return c.json({ error: "Failed to assign orders" }, 500);
      }

      return c.json({ data });
    }
  )
  .patch(
    "/:orderId",
    verifyAuth(),
    zValidator("param", z.object({ orderId: z.string().optional() })),
    zValidator(
      "json",
      z.object({
        delivererId: z.string(),
        status: z.enum([
          "ACCEPTED",
          "PREPARING",
          "FINISHED",
          "IN_TRANSIT",
          "DELIVERED",
          "CANCELLED",
        ]),
        type: z.enum(["LOCAL", "WEBSITE", "WHATSAPP"]),
        payment_status: z.enum(["PENDING", "PAID", "CANCELLED"]),
        delivery_deadline: z.number().optional(),
        pickup_deadline: z.number().optional(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { orderId } = c.req.valid("param");
      const {
        delivererId,
        payment_status,
        status,
        type,
        delivery_deadline,
        pickup_deadline,
      } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!orderId || !delivererId || !status || !payment_status || !type) {
        return c.json({ error: "Missing data or orderId" }, 400);
      }

      const data = await db
        .update(orders)
        .set({
          delivererId,
          status,
          payment_status,
          type,
          delivery_deadline,
          pickup_deadline,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      if (!data) {
        return c.json({ error: "Failed to update order" }, 500);
      }

      return c.json({ data });
    }
  )
  .patch(
    "/status/:orderId",
    verifyAuth(),
    zValidator("param", z.object({ orderId: z.string().optional() })),
    zValidator(
      "json",
      z.object({
        status: z.enum([
          "ACCEPTED",
          "PREPARING",
          "FINISHED",
          "IN_TRANSIT",
          "DELIVERED",
          "CANCELLED",
        ]),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { orderId } = c.req.valid("param");
      const { status } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!orderId || !status) {
        return c.json({ error: "Missing order id or status" }, 400);
      }

      const data = await db
        .update(orders)
        .set({ status: status, updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      if (!data) {
        return c.json({ error: "Failed to update order" }, 500);
      }

      return c.json({ data });
    }
  );

export default app;
