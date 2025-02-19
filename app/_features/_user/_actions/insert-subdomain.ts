"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { insertUserSubdomainSchema } from "@/db/schemas";
import { eq } from "drizzle-orm";

export const insertSubdomain = async (
  values: z.infer<typeof insertUserSubdomainSchema>
) => {
  try {
    const session = await auth();
    const validatedValues = insertUserSubdomainSchema.safeParse(values);

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { subdomain } = validatedValues.data;

    if (!subdomain) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const data = await db
      .update(users)
      .set({
        subdomain,
      })
      .where(eq(users.id, session.user.id));

    if (!data) {
      return {
        success: false,
        message: "Falha ao criar salvar seu domínio",
      };
    }

    return { success: true, message: "Domínio salvo com sucesso!" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao salvar o domínio",
    };
  }
};
