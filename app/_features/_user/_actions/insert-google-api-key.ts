"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { insertApiKeySchema } from "@/db/schemas";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export const insertGoogleApiKey = async (
  values: z.infer<typeof insertApiKeySchema>
) => {
  try {
    const session = await auth();
    const validatedValues = insertApiKeySchema.safeParse(values);

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { apiKey } = validatedValues.data;

    if (!apiKey) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const key = await db
      .update(users)
      .set({
        googleApiKey: apiKey,
      })
      .where(eq(users.id, session.user.id));

    if (!key) {
      return {
        success: false,
        message: "Falha ao criar salvar a chave API",
      };
    }

    revalidatePath("/dashboard/delivery-areas");
    return { success: true, message: "Chave API salva com sucesso!" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao salvar a chave API",
    };
  }
};
