import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { templates } from "@/db/schema";

const app = new Hono().get("/", async (c) => {
  const data = await db.select().from(templates);

  if (!data) {
    return c.json({ error: "No templates found" }, 404);
  }

  return c.json({ data });
});
export default app;
