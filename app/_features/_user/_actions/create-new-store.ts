"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { stores } from "@/db/schema";
import { insertStoreSchema } from "@/db/schemas";

export const createNewStore = async (
  values: z.infer<typeof insertStoreSchema>
) => {
  try {
    const session = await auth();
    const validatedValues = insertStoreSchema.safeParse(values);

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { name } = validatedValues.data;

    if (!name) {
      return { success: false, message: "Preencha o nome" };
    }

    const [data] = await db
      .insert(stores)
      .values({
        name,
        userId: session.user.id,
      })
      .returning({
        id: stores.id,
      });

    if (!data) {
      return { success: false, message: "Erro ao criar loja" };
    }

    return {
      success: true,
      message: "Loja criada com sucesso",
      storeId: data.id,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao processar os pixels",
    };
  }
};
