"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { deliveryAreasKm, deliveryAreasKmFees } from "@/db/schema";
import { insertDeliveryAreaKmSchema } from "@/db/schemas";
import { eq } from "drizzle-orm";

export const createDeliveryAreasKm = async (
  values: z.infer<typeof insertDeliveryAreaKmSchema>,
  storeId: string
) => {
  try {
    const session = await auth();
    const validatedValues = insertDeliveryAreaKmSchema.safeParse(values);

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { latitude, longitude, fees } = validatedValues.data;

    if (!latitude || !longitude || !fees || fees.length === 0) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    // Check if the delivery area already exists
    const existingArea = await db
      .select()
      .from(deliveryAreasKm)
      .where(eq(deliveryAreasKm.storeId, storeId))
      .limit(1);

    let deliveryAreaKm;

    if (existingArea.length > 0) {
      // Update existing delivery area
      [deliveryAreaKm] = await db
        .update(deliveryAreasKm)
        .set({
          latitude,
          longitude,
          updatedAt: new Date(), // Ensure updatedAt is refreshed
        })
        .where(eq(deliveryAreasKm.id, existingArea[0].id))
        .returning({ id: deliveryAreasKm.id });
    } else {
      // Insert new delivery area
      [deliveryAreaKm] = await db
        .insert(deliveryAreasKm)
        .values({
          storeId,
          latitude,
          longitude,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: deliveryAreasKm.id });
    }

    if (!deliveryAreaKm) {
      return {
        success: false,
        message: "Falha ao salvar as informações",
      };
    }

    // Fetch existing fees for this delivery area
    const existingFees = await db
      .select()
      .from(deliveryAreasKmFees)
      .where(eq(deliveryAreasKmFees.deliveryAreaId, deliveryAreaKm.id));

    // Identify fees to delete (fees that are not present in the new list)
    const feesToDelete = existingFees.filter(
      (fee) =>
        !fees.some(
          (newFee) =>
            newFee.distance === fee.distance && newFee.price === fee.price
        )
    );

    if (feesToDelete.length > 0) {
      await db
        .delete(deliveryAreasKmFees)
        .where(eq(deliveryAreasKmFees.deliveryAreaId, deliveryAreaKm.id));
    }

    // Insert new fees
    const feeValues = fees.map((fee) => ({
      deliveryAreaId: deliveryAreaKm.id,
      distance: fee.distance,
      price: fee.price,
    }));

    await db.insert(deliveryAreasKmFees).values(feeValues);

    return {
      success: true,
      message: "Informações salvas com sucesso!",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao salvar as informações",
    };
  }
};
