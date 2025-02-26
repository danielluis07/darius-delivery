import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { pixels } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono().get(
  "/user/:userId",
  zValidator("param", z.object({ userId: z.string().optional() })),
  async (c) => {
    const { userId } = c.req.valid("param");

    if (!userId) {
      return c.json({ error: "Missing user id" }, 400);
    }

    const [data] = await db
      .select()
      .from(pixels)
      .where(eq(pixels.userId, userId));

    if (!data) {
      return c.json({ error: "Pixel not found" }, 404);
    }

    return c.json({ data });
  }
);

export default app;
