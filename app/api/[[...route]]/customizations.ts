import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { customizations, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono()
  .get(
    "/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const [data] = await db
        .select()
        .from(customizations)
        .where(eq(customizations.user_id, userId));

      if (!data) {
        return c.json({ error: "No templates found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/user/:domain",
    zValidator("param", z.object({ domain: z.string().optional() })),
    async (c) => {
      const { domain } = c.req.valid("param");

      if (!domain) {
        return c.json({ error: "Missing domain" }, 400);
      }

      const [data] = await db
        .select({
          userId: users.id,
        })
        .from(users)
        .innerJoin(customizations, eq(users.id, customizations.user_id))
        .where(eq(users.domain, domain));

      if (!data) {
        return c.json({ error: "No templates found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/isOpen/:userId",
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
        .where(eq(customizations.user_id, userId));

      if (!data) {
        return c.json({ error: "No templates found" }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
