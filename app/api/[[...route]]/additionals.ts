import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { additionals, additionalGroups } from "@/db/schema";
import { additionalGroupSchema } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";

const app = new Hono()
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db
        .select()
        .from(additionals)
        .innerJoin(
          additionalGroups,
          eq(additionalGroups.id, additionals.additionalGroupId)
        )
        .where(eq(additionals.id, id));

      if (!data) {
        return c.json({ error: "No additionals found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const data = await db
        .select({
          id: additionalGroups.id,
          name: additionalGroups.name,
        })
        .from(additionalGroups)
        .where(eq(additionalGroups.userId, userId));

      if (!data || data.length === 0) {
        return c.json({ error: "No additionals found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    "/",
    verifyAuth(),
    zValidator("json", additionalGroupSchema),
    async (c) => {
      const auth = c.get("authUser");
      const values = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [newGroup] = await db
        .insert(additionalGroups)
        .values({
          userId: auth.token.sub,
          name: values.name,
          selectionType: values.selectionType,
          isRequired: values.isRequired,
        })
        .returning({
          id: additionalGroups.id,
        });

      if (values.additionals && values.additionals.length > 0) {
        const additionalValues = values.additionals.map((add) => ({
          additionalGroupId: newGroup.id,
          name: add.name,
          priceAdjustment: add.priceAdjustment,
        }));

        await db.insert(additionals).values(additionalValues);
      }

      if (!newGroup) {
        return c.json({ error: "Failed to insert data" }, 500);
      }

      return c.json({ newGroup });
    }
  );

export default app;
