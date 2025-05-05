"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { pixels } from "@/db/schema";
import { insertPixelsSchema } from "@/db/schemas";
import { eq } from "drizzle-orm";

export const createPixels = async (
  values: z.infer<typeof insertPixelsSchema>,
  storeId: string
) => {
  try {
    const session = await auth();
    const validatedValues = insertPixelsSchema.safeParse(values);

    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { pixel_facebook, pixel_google, pixel_tiktok } = validatedValues.data;

    if (!pixel_facebook && !pixel_google && !pixel_tiktok) {
      return { success: false, message: "Preencha ao menos um pixel" };
    }

    const [existingPixel] = await db
      .select()
      .from(pixels)
      .where(eq(pixels.storeId, storeId));

    if (existingPixel) {
      const updated = await db
        .update(pixels)
        .set({
          pixel_facebook: pixel_facebook || existingPixel.pixel_facebook,
          pixel_google: pixel_google || existingPixel.pixel_google,
          pixel_tiktok: pixel_tiktok || existingPixel.pixel_tiktok,
          updatedAt: new Date(),
        })
        .where(eq(pixels.storeId, storeId));

      if (updated) {
        return { success: true, message: "Pixels atualizados com sucesso" };
      } else {
        return { success: false, message: "Falha ao atualizar os pixels" };
      }
    } else {
      const inserted = await db.insert(pixels).values({
        storeId,
        pixel_facebook: pixel_facebook || null,
        pixel_google: pixel_google || null,
        pixel_tiktok: pixel_tiktok || null,
      });

      if (inserted) {
        return { success: true, message: "Pixels criados com sucesso" };
      } else {
        return { success: false, message: "Falha ao criar os pixels" };
      }
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao processar os pixels",
    };
  }
};
