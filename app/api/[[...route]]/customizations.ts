import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { customizations, templateAddress } from "@/db/schema";
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
        .from(customizations)
        .where(eq(customizations.userId, userId));

      if (!data) {
        return c.json({ error: "No templates found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/address/store/:storeId",
    zValidator("param", z.object({ storeId: z.string().optional() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      if (!storeId) {
        return c.json({ error: "Missing store id" }, 400);
      }

      const [data] = await db
        .select()
        .from(templateAddress)
        .where(eq(templateAddress.storeId, storeId));

      if (!data) {
        return c.json({ error: "No template address found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/isOpen/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const [data] = await db
        .select({
          isOpen: customizations.isOpen,
        })
        .from(customizations)
        .where(eq(customizations.userId, userId));

      if (!data) {
        return c.json({ error: "No templates found" }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
