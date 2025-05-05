import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { restaurantData } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const app = new Hono()
  .get(
    "/store/:storeId",
    zValidator("param", z.object({ storeId: z.string() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      const [data] = await db
        .select()
        .from(restaurantData)
        .where(eq(restaurantData.storeId, storeId));

      if (!data) {
        return c.json({ error: "Restaurante não encontrado" }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    "/menu-views/store/:storeId",
    zValidator("param", z.object({ storeId: z.string() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      const [existingData] = await db
        .select()
        .from(restaurantData)
        .where(eq(restaurantData.storeId, storeId));

      if (!existingData) {
        await db.insert(restaurantData).values({ storeId, menuViews: 1 });
        return c.json({
          message: "Visualização registrada com sucesso",
          data: { storeId, menuViews: 1 },
        });
      }

      const updated = await db
        .update(restaurantData)
        .set({ menuViews: sql`${restaurantData.menuViews} + 1` })
        .where(eq(restaurantData.storeId, storeId));

      return c.json({
        message: "Visualização registrada com sucesso",
        data: updated,
      });
    }
  )
  .post(
    "/cart/store/:storeId",
    zValidator("param", z.object({ storeId: z.string() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      // Incrementa a contagem de itemsAddedToCart
      const updated = await db
        .update(restaurantData)
        .set({ itemsAddedToCart: sql`${restaurantData.itemsAddedToCart} + 1` }) // Incrementa 1
        .where(eq(restaurantData.storeId, storeId))
        .returning();

      if (!updated.length) {
        return c.json({ error: "Restaurante não encontrado" }, 404);
      }

      return c.json({
        message: "Item adicionado ao carrinho",
        data: updated[0],
      });
    }
  )
  .post(
    "/purchased/store/:userId",
    zValidator("param", z.object({ storeId: z.string() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      const updated = await db
        .update(restaurantData)
        .set({ itemsPurchased: sql`${restaurantData.itemsPurchased} + 1` }) // Incrementa 1
        .where(eq(restaurantData.storeId, storeId))
        .returning();

      if (!updated.length) {
        return c.json({ error: "Restaurante não encontrado" }, 404);
      }

      return c.json({
        data: updated[0],
      });
    }
  )
  .post(
    "/withdrawal/store/:storeId",
    zValidator("param", z.object({ storeId: z.string() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      const updated = await db
        .update(restaurantData)
        .set({ withdrawals: sql`${restaurantData.withdrawals} + 1` }) // Incrementa 1
        .where(eq(restaurantData.storeId, storeId))
        .returning();

      if (!updated.length) {
        return c.json({ error: "Restaurante não encontrado" }, 404);
      }

      return c.json({
        data: updated[0],
      });
    }
  );

export default app;
