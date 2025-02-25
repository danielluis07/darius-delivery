"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users, customers } from "@/db/schema";
import { insertCustomerSchema } from "@/db/schemas";
import { signIn } from "@/auth";

// Helper function to hash a password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer).toString("hex");
}

export const credentialsSignUp = async (
  values: z.infer<typeof insertCustomerSchema>
) => {
  try {
    const validatedValues = insertCustomerSchema.safeParse(values);

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const {
      name,
      email,
      phone,
      password,
      street,
      street_number,
      complement,
      restaurantOwnerId,
      city,
      neighborhood,
      state,
    } = validatedValues.data;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !street ||
      !street_number ||
      !city ||
      !neighborhood ||
      !state
    ) {
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

    // Hash the password using SHA-256
    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        role: "CUSTOMER",
        phone,
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id });

    if (!newUser) {
      return { success: false, message: "Erro ao criar usuário" };
    }

    const newCustomer = await db.insert(customers).values({
      userId: newUser.id,
      street,
      street_number,
      complement: complement || null,
      restaurantOwnerId,
      city,
      neighborhood,
      state,
    });

    if (!newCustomer) {
      return { success: false, message: "Erro ao criar cliente" };
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return {
      success: true,
      message: "Usuário criado com sucesso",
    };
  } catch (error) {
    console.error("Error during user sign-up:", error);
    return {
      success: false,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
};
