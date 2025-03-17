import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { employees, users } from "@/db/schema";
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
    "/googleapikey/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db
        .select({ googleApiKey: users.googleApiKey })
        .from(users)
        .where(eq(users.id, userId));

      if (!data) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/domain/:userId",
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
    "/employees/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
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
        .where(eq(employees.restaurantOwnerId, userId));

      if (!data || data.length === 0) {
        return c.json({ error: "No employees found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/employee/:employeeId",
    zValidator("param", z.object({ employeeId: z.string().optional() })),
    async (c) => {
      const { employeeId } = c.req.valid("param");

      if (!employeeId) {
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
        .where(eq(employees.userId, employeeId));

      if (!data) {
        return c.json({ error: "Employee not found" }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
