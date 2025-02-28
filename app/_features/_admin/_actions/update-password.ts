"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { updatePasswordSchema } from "@/db/schemas";
import { auth } from "@/auth";

// Helper function to hash a password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer).toString("hex");
}

export const updatePassword = async (
  values: z.infer<typeof updatePasswordSchema>
) => {
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const validatedValues = updatePasswordSchema.safeParse(values);

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { password, new_password, repeat_new_password } =
      validatedValues.data;

    if (!password || !new_password || !repeat_new_password) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const [user] = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user || !user.password) {
      return { success: false, message: "Usuário não cadastrado!" };
    }

    const hashedInputPassword = await hashPassword(password);

    if (hashedInputPassword !== user.password) {
      return { success: false, message: "Senha incorreta!" };
    }

    const hashedNewPassword = await hashPassword(new_password);

    const updatedUser = await db
      .update(users)
      .set({
        password: hashedNewPassword,
      })
      .where(eq(users.id, session.user.id));

    if (!updatedUser) {
      return { success: false, message: "Erro ao atualizar a senha" };
    }

    return {
      success: true,
      message: "Senha atualizada com sucesso!",
    };
  } catch (error) {
    console.error("Error while updating password:", error);
    return { success: false, message: "Erro inesperado ao atualizar a senha" };
  }
};
