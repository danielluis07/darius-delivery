"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users, customers } from "@/db/schema";
import { insertCustomerSchema } from "@/db/schemas";
import { signIn } from "@/auth";
import { createCustomer } from "@/lib/asaas";

// Helper function to hash a password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer).toString("hex");
}

export const credentialsSignUp = async (
  values: z.infer<typeof insertCustomerSchema>,
  apiKey: string
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
      cpfCnpj,
      postalCode,
      storeId,
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
      !postalCode ||
      !cpfCnpj ||
      !street_number ||
      !city ||
      !neighborhood ||
      !state ||
      !apiKey
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

    const { customerId, success, message } = await createCustomer({
      name,
      email,
      cpfCnpj,
      phone,
      postalCode,
      street,
      street_number,
      neighborhood,
      apiKey,
    });

    if (!success) {
      return {
        success: false,
        message, // Retorna os erros específicos do Asaas
      };
    }

    // Hash the password using SHA-256
    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        role: "CUSTOMER",
        cpfCnpj,
        phone,
        postalCode,
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
      storeId,
      asaasCustomerId: customerId,
      city,
      postalCode,
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
