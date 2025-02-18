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
} from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";

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
          item: {
            id: orderItems.id,
            quantity: orderItems.quantity,
            price: orderItems.price,
          },
          product: {
            id: products.id,
            name: products.name,
            description: products.description,
            image: products.image,
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
          deliverer: {
            id: deliverers.id,
            name: deliverers.name,
            phone: deliverers.phone,
          },
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.order_id))
        .innerJoin(users, eq(orders.customer_id, users.id))
        .leftJoin(deliverers, eq(orders.delivererId, deliverers.id))
        .leftJoin(products, eq(orderItems.product_id, products.id))
        .leftJoin(customers, eq(orders.customer_id, customers.userId))
        .where(eq(orders.id, orderId));

      if (!data) {
        return c.json({ error: "Order not found" }, 404);
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

      if (
        !orderId ||
        !delivererId ||
        !status ||
        !payment_status ||
        !type ||
        !delivery_deadline ||
        !pickup_deadline
      ) {
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
