"use server";

import { db } from "@/db/drizzle";
import { passwordResetToken, users } from "@/db/schema";
import { resetPasswordSchema } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer).toString("hex");
}

export const resetPassword = async (
  values: z.infer<typeof resetPasswordSchema>,
  token: string
) => {
  try {
    const validatedValues = resetPasswordSchema.safeParse(values);

    if (!validatedValues.success) {
      return { error: true, message: "Campos inválidos" };
    }

    const { newPassword } = validatedValues.data;

    if (!newPassword) {
      return { error: true, message: "Campos obrigatórios não preenchidos" };
    }

    const [existingToken] = await db
      .select({
        id: passwordResetToken.id,
        email: passwordResetToken.email,
        token: passwordResetToken.token,
        expires: passwordResetToken.expires,
      })
      .from(passwordResetToken)
      .where(eq(passwordResetToken.token, token));

    if (!existingToken) {
      return {
        error: true,
        message: "Token inválido ou expirado.",
      };
    }

    const now = new Date(); // Pega a data e hora atuais
    const tokenExpiresAt = new Date(existingToken.expires); // Converte o timestamp de expiração do DB para um objeto Date

    if (now > tokenExpiresAt) {
      // O token expirou porque a hora atual é MAIOR (mais tarde) que a hora de expiração do token.

      // É uma boa prática deletar o token expirado do banco para limpeza.
      await db
        .delete(passwordResetToken)
        .where(eq(passwordResetToken.id, existingToken.id));

      return {
        error: true,
        message:
          "Seu token de redefinição de senha expirou. Por favor, solicite um novo link.",
      };
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await db
      .update(users)
      .set({
        password: hashedPassword,
      })
      .where(eq(users.email, existingToken.email));

    if (!updatedUser) {
      return {
        error: true,
        message: "Erro ao atualizar a senha.",
      };
    }

    return {
      success: true,
      message: "Senha redefinida com sucesso.",
    };
  } catch (error) {
    console.error("Error during password reset:", error);
    return {
      error: true,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
};
