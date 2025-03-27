import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono()
  .get(
    "/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const [data] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.user_id, userId));

      if (!data) {
        return c.json({ error: "No subscription found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post("/", async (c) => {
    const body = await c.req.parseBody();
    const { name, preview_image } = body;

    if (!name || !preview_image) {
      return c.text("Missing required fields", 400);
    }

    return c.text("Test message", 201);
  });
export default app;
