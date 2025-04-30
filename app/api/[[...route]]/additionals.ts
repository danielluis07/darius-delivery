import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import {
  additionals,
  additionalGroups,
  categoryAdditionalGroups,
} from "@/db/schema";
import { additionalGroupSchema } from "@/db/schemas";
import { eq, inArray } from "drizzle-orm";
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

      const rows = await db
        .select({
          groupId: additionalGroups.id,
          groupName: additionalGroups.name,
          additionalId: additionals.id,
          additionalName: additionals.name,
          additionalPrice: additionals.priceAdjustment,
        })
        .from(additionalGroups)
        .leftJoin(
          additionals,
          eq(additionalGroups.id, additionals.additionalGroupId)
        )
        .where(eq(additionalGroups.id, id));

      if (!rows.length) {
        return c.json({ error: "No additionals found" }, 404);
      }

      const { groupId, groupName } = rows[0];

      const additionalsList = rows
        .filter((row) => row.additionalId) // ignora linhas sem adicional (se houver)
        .map((row) => ({
          id: row.additionalId,
          name: row.additionalName,
          priceAdjustment: row.additionalPrice,
        }));

      return c.json({
        data: {
          id: groupId,
          name: groupName,
          additionals: additionalsList,
        },
      });
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
  .get(
    "/user/:userId/additional-group/:groupId",
    zValidator(
      "param",
      z.object({
        userId: z.string().optional(),
        groupId: z.string().optional(),
      })
    ),
    async (c) => {
      const { userId, groupId } = c.req.valid("param");

      if (!userId || !groupId) {
        return c.json({ error: "Missing user id or group id" }, 400);
      }

      const [data] = await db
        .select({
          categoryId: categoryAdditionalGroups.categoryId,
        })
        .from(categoryAdditionalGroups)
        .where(eq(categoryAdditionalGroups.additionalGroupId, groupId));

      if (!data) {
        return c.json({ error: "No category found" }, 404);
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

      try {
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

        if (!newGroup) {
          return c.json({ error: "Failed to create additional group" }, 500);
        }

        if (values.additionals && values.additionals.length > 0) {
          const additionalValues = values.additionals.map((add) => ({
            additionalGroupId: newGroup.id,
            name: add.name,
            priceAdjustment: add.priceAdjustment,
          }));

          await db.insert(additionals).values(additionalValues);
        }

        await db.insert(categoryAdditionalGroups).values({
          categoryId: values.category_id,
          additionalGroupId: newGroup.id,
        });

        return c.json({ newGroup }, 201);
      } catch (error) {
        console.error("Error creating additional group:", error);
        return c.json({ error: "Failed to create additional group" }, 500);
      }
    }
  )
  .patch(
    "/:id",
    verifyAuth(),
    zValidator("json", additionalGroupSchema),
    async (c) => {
      const auth = c.get("authUser");
      const values = c.req.valid("json");
      const { id } = c.req.param();

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await db
        .update(additionalGroups)
        .set({
          name: values.name,
          selectionType: values.selectionType,
          isRequired: values.isRequired,
        })
        .where(eq(additionalGroups.id, id));

      await db.delete(additionals).where(eq(additionals.additionalGroupId, id));

      if (values.additionals && values.additionals.length > 0) {
        const additionalValues = values.additionals.map((add) => ({
          additionalGroupId: id,
          name: add.name,
          priceAdjustment: add.priceAdjustment,
        }));

        await db.insert(additionals).values(additionalValues);
      }

      return c.json({ success: true });
    }
  )
  .post(
    "/delete",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { ids } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!ids || ids.length === 0) {
        return c.json({ error: "Missing ids" }, 400);
      }

      const data = await db
        .delete(additionalGroups)
        .where(inArray(additionalGroups.id, ids));

      if (!data) {
        return c.json({ error: "Failed to delete additional groups" }, 500);
      }

      return c.json({ data });
    }
  )
  .delete(
    "/:id",
    verifyAuth(),
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const data = await db
        .delete(additionalGroups)
        .where(eq(additionalGroups.id, id));

      if (!data) {
        return c.json({ error: "Failed to delete additional group" }, 500);
      }

      return c.json({ data });
    }
  );

export default app;
