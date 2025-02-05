import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
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
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db.select().from(users).where(eq(users.id, id));

      if (!data) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json({ data }, 200);
    }
  );

export default app;
