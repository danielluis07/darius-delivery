import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { insertCategorySchema } from "@/db/schemas";

const app = new Hono()
  .get("/", async (c) => {
    const data = await db.select().from(categories);

    if (!data || data.length === 0) {
      return c.json({ error: "No categories found" }, 404);
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

      const [data] = await db
        .select({
          id: categories.id,
          name: categories.name,
          image: categories.image,
        })
        .from(categories)
        .where(eq(categories.id, id));

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    "/",
    zValidator(
      "json",
      insertCategorySchema.pick({ name: true, image: true, userId: true })
    ),
    async (c) => {}
  );

export default app;
