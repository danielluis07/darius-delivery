import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { templates } from "@/db/schema";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const app = new Hono()
  .get("/", async (c) => {
    const data = await db.select().from(templates);

    if (!data) {
      return c.json({ error: "No templates found" }, 404);
    }

    return c.json({ data });
  })
  .post("/", async (c) => {
    const body = await c.req.parseBody();
    const { name, preview_image } = body;

    if (!name || !preview_image) {
      return c.text("Missing required fields", 400);
    }

    return c.text("Test message", 201);
  });
export default app;
