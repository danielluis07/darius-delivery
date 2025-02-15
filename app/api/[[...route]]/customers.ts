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

      const data = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          address: customers.address,
          neighborhood: customers.neighborhood,
          city: customers.city,
          state: customers.state,
          createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(customers, eq(customers.userId, users.id))
        .where(eq(customers.restaurantOwnerId, userId));

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
      const { name, email, phone, address, neighborhood, city, state } =
        c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (
        !name ||
        !email ||
        !phone ||
        !address ||
        !neighborhood ||
        !city ||
        !state
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
        restaurantOwnerId: auth.token.sub,
        address,
        neighborhood,
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
