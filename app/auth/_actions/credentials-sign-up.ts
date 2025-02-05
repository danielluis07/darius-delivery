"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { eq, or } from "drizzle-orm";
import { users } from "@/db/schema";
import { credentialsSignUpSchema } from "@/db/schemas";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";

export const credentialsSignUp = async (
  values: z.infer<typeof credentialsSignUpSchema>
) => {
  try {
    const validatedValues = credentialsSignUpSchema.safeParse(values);

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { name, email, phone, password } = validatedValues.data;

    if (!name || !email || !phone || !password) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const [existingUser] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return {
        success: false,
        message: "O email informado já está cadastrado",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        role: "USER",
        phone,
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id, role: users.role });

    if (!newUser) {
      return { success: false, message: "Erro ao criar usuário" };
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return {
      success: true,
      message: "Usuário criado com sucesso",
      url: "/dashboard",
    };
  } catch (error) {
    console.error("Error during user sign-up:", error);
    return {
      success: false,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
};
