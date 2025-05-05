import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { customers, users } from "@/db/schema";
import { insertLocalCustomerSchema } from "@/db/schemas";
import { eq, inArray } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";

const app = new Hono()
  .get(
    "/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const [data] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          street: customers.street,
          street_number: customers.street_number,
          complement: customers.complement,
          neighborhood: customers.neighborhood,
          city: customers.city,
          state: customers.state,
          createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(customers, eq(customers.userId, users.id))
        .where(eq(customers.userId, userId));

      if (!data) {
        return c.json({ error: "Customer not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/store/:storeId",
    verifyAuth(),
    zValidator("param", z.object({ storeId: z.string().optional() })),
    async (c) => {
      const { storeId } = c.req.valid("param");
      const auth = c.get("authUser");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!storeId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const data = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          customerId: customers.id,
          phone: users.phone,
          street: customers.street,
          street_number: customers.street_number,
          complement: customers.complement,
          neighborhood: customers.neighborhood,
          city: customers.city,
          state: customers.state,
          postalCode: customers.postalCode,
          createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(customers, eq(customers.userId, users.id))
        .where(eq(customers.storeId, storeId));

      if (!data || data.length === 0) {
        return c.json({ error: "No customers found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    "/",
    verifyAuth(),
    zValidator("json", insertLocalCustomerSchema),
    async (c) => {
      const auth = c.get("authUser");
      const {
        name,
        email,
        phone,
        street,
        street_number,
        complement,
        postalCode,
        neighborhood,
        city,
        state,
        storeId,
      } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (
        !name ||
        !email ||
        !phone ||
        !street ||
        !street_number ||
        !postalCode ||
        !neighborhood ||
        !city ||
        !state ||
        !storeId
      ) {
        return c.json({ error: "Missing data" }, 400);
      }

      const [user] = await db
        .insert(users)
        .values({
          email,
          phone,
          name,
          role: "CUSTOMER",
        })
        .returning({ id: users.id });

      if (!user) {
        return c.json({ error: "Failed to create user" }, 500);
      }

      const customer = await db.insert(customers).values({
        userId: user.id,
        storeId,
        street,
        street_number,
        complement,
        neighborhood,
        postalCode,
        city,
        state,
      });

      if (!customer) {
        return c.json({ error: "Failed to insert data" }, 500);
      }

      return c.json({ user, customer });
    }
  )
  .post(
    "/delete",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const values = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db.delete(users).where(inArray(users.id, values.ids));

      if (!data) {
        return c.json({ error: "Failed to delete customers" }, 500);
      }

      return c.json({ data });
    }
  )
  .patch(
    "/:userId",
    verifyAuth(),
    zValidator("param", z.object({ userId: z.string().optional() })),
    zValidator("json", insertLocalCustomerSchema),
    async (c) => {
      const auth = c.get("authUser");
      const { userId } = c.req.valid("param");
      const {
        name,
        email,
        phone,
        street,
        street_number,
        complement,
        neighborhood,
        city,
        state,
      } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const [user] = await db
        .update(users)
        .set({
          email,
          phone,
          name,
        })
        .where(eq(users.id, userId))
        .returning({ id: users.id });

      if (!user) {
        return c.json({ error: "Failed to update user" }, 500);
      }

      const customer = await db
        .update(customers)
        .set({
          street,
          street_number,
          complement,
          neighborhood,
          city,
          state,
        })
        .where(eq(customers.userId, userId))
        .returning({ id: customers.id });

      if (!customer) {
        return c.json({ error: "Failed to update customer" }, 500);
      }

      return c.json({ user, customer });
    }
  )
  .delete(
    "/:id",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const data = await db.delete(users).where(eq(users.id, id));

      if (!data) {
        return c.json({ error: "Failed to delete customer" }, 500);
      }

      return c.json({ data });
    }
  );
export default app;
