"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { credentialsSignInSchema } from "@/db/schemas";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

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

    const passwordsMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!passwordsMatch) {
      return { success: false, message: "Senha incorreta!" };
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return {
      success: true,
      url: callbackUrl || "/dashboard",
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
