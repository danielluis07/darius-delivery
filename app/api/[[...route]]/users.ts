import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { employees, stores, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono()
  .get("/", async (c) => {
    const data = await db.select().from(users);

    if (!data) {
      return c.json({ error: "No users found" }, 404);
    }

    return c.json({ data });
  })
  .get(
    "/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db.select().from(users).where(eq(users.id, userId));

      if (!data) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/googleapikey/store/:storeId",
    zValidator("param", z.object({ storeId: z.string().optional() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      if (!storeId) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db
        .select({ googleApiKey: stores.googleApiKey })
        .from(stores)
        .where(eq(stores.id, storeId));

      if (!data) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/domain/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db
        .select({ domain: users.domain })
        .from(users)
        .where(eq(users.id, userId));

      if (!data) {
        return c.json({ error: "Domain not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/employees/store/:storeId",
    zValidator("param", z.object({ storeId: z.string().optional() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      if (!storeId) {
        return c.json({ error: "Missing id" }, 400);
      }

      const data = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          createdAt: users.createdAt,
        })
        .from(employees)
        .innerJoin(users, eq(employees.userId, users.id))
        .where(eq(employees.storeId, storeId));

      if (!data || data.length === 0) {
        return c.json({ error: "No employees found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/employee/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          password: users.password,
          permissions: employees.permissions,
        })
        .from(employees)
        .innerJoin(users, eq(employees.userId, users.id))
        .where(eq(employees.userId, userId));

      if (!data) {
        return c.json({ error: "Employee not found" }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
