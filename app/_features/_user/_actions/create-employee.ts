"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { employees, users } from "@/db/schema";
import { createEmployeeSchema } from "@/db/schemas";

// Helper function to hash a password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer).toString("hex");
}

export const createEmployee = async (
  values: z.infer<typeof createEmployeeSchema>,
  storeId: string
) => {
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const validatedValues = createEmployeeSchema.safeParse(values);

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { name, email, phone, password, permissions } = validatedValues.data;

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

    // Hash the password using SHA-256
    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        role: "EMPLOYEE",
        phone,
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id, role: users.role });

    if (!newUser) {
      return { success: false, message: "Erro ao criar usuário" };
    }

    const employee = await db.insert(employees).values({
      userId: newUser.id,
      storeId,
      permissions,
    });

    if (!employee) {
      return { success: false, message: "Erro ao criar funcionário" };
    }

    return {
      success: true,
      message: "Funcionário criado com sucesso",
    };
  } catch (error) {
    console.error("Error while creating employee:", error);
    return {
      success: false,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
};
