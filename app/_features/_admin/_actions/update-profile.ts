"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { baseUserSchema } from "@/db/schemas";
import { auth } from "@/auth";

export const updateProfile = async (values: z.infer<typeof baseUserSchema>) => {
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const validatedValues = baseUserSchema.safeParse(values);

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { name, email } = validatedValues.data;

    if (!name || !email) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const updatedUser = await db
      .update(users)
      .set({
        name,
        email,
      })
      .where(eq(users.id, session.user.id));

    if (!updatedUser) {
      return {
        success: false,
        message: "Erro ao atualizar as informações de perfil",
      };
    }

    return {
      success: true,
      message: "Informações atualizadas com sucesso!",
    };
  } catch (error) {
    console.error("Error while updating profile:", error);
    return {
      success: false,
      message: "Erro inesperado ao atualizar as informações de perfil",
    };
  }
};
