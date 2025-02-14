import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { deliveryAreasKm, deliveryAreasKmFees } from "@/db/schema";
import { eq } from "drizzle-orm";

const app = new Hono().get(
  "/user/:userId",
  zValidator("param", z.object({ userId: z.string().optional() })),
  async (c) => {
    const { userId } = c.req.valid("param");

    if (!userId) {
      return c.json({ error: "Missing user id" }, 400);
    }

    // First get the delivery area
    const [deliveryArea] = await db
      .select()
      .from(deliveryAreasKm)
      .where(eq(deliveryAreasKm.userId, userId));

    if (!deliveryArea) {
      return c.json({ error: "No delivery area per km found" }, 404);
    }

    // Then get all fees for this delivery area
    const fees = await db
      .select({
        distance: deliveryAreasKmFees.distance,
        price: deliveryAreasKmFees.price,
      })
      .from(deliveryAreasKmFees)
      .where(eq(deliveryAreasKmFees.deliveryAreaId, deliveryArea.id))
      .orderBy(deliveryAreasKmFees.distance);

    // Return combined data
    return c.json({
      data: {
        ...deliveryArea,
        fees,
      },
    });
  }
);
export default app;
