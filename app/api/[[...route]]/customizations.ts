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
    "/user/:subdomain",
    zValidator("param", z.object({ subdomain: z.string().optional() })),
    async (c) => {
      const { subdomain } = c.req.valid("param");

      if (!subdomain) {
        return c.json({ error: "Missing subdomain" }, 400);
      }

      const [data] = await db
        .select({
          userId: users.id,
        })
        .from(users)
        .innerJoin(customizations, eq(users.id, customizations.user_id))
        .where(eq(users.subdomain, subdomain));

      if (!data) {
        return c.json({ error: "No templates found" }, 404);
      }

      return c.json({ data });
    }
  );
export default app;
