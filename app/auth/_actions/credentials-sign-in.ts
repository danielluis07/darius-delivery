"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { credentialsSignInSchema } from "@/db/schemas";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// Helper function to hash a password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer).toString("hex");
}

export const credentialsSignIn = async (
  values: z.infer<typeof credentialsSignInSchema>,
  callbackUrl?: string | null
) => {
  try {
    const validatedValues = credentialsSignInSchema.safeParse(values);

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { email, password } = validatedValues.data;

    if (!email || !password) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const [existingUser] = await db
      .select({ role: users.role, password: users.password })
      .from(users)
      .where(eq(users.email, email));

    if (!existingUser || !existingUser.password) {
      return { success: false, message: "Usuário não cadastrado!" };
    }

    // Hash the input password to compare with the stored hash
    const hashedInputPassword = await hashPassword(password);

    if (hashedInputPassword !== existingUser.password) {
      return { success: false, message: "Senha incorreta!" };
    }

    const url = existingUser.role === "ADMIN" ? "/admin" : "/dashboard";

    await signIn("credentials", {
      email,
      password,
      redirectTo: url,
    });

    return {
      success: true,
      url: callbackUrl || url,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Credenciais inválidas" };
        default:
          return {
            success: false,
            message: "Erro interno no servidor. Tente novamente mais tarde.",
          };
      }
    }
    throw error;
  }
};
