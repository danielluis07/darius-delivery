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

export const updateEmployee = async (
  userId: string,
  values: z.infer<typeof createEmployeeSchema>
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

    if (!userId || !name || !email || !phone || !password) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    // Hash the password using SHA-256
    const hashedPassword = await hashPassword(password);

    const updatedUser = await db
      .update(users)
      .set({
        name,
        phone,
        email,
        password: hashedPassword,
      })
      .where(eq(users.id, userId));

    if (!updatedUser) {
      return { success: false, message: "Erro ao atualizar funcionário" };
    }

    const updatedEmployee = await db
      .update(employees)
      .set({
        permissions,
      })
      .where(eq(employees.userId, userId));

    if (!updatedEmployee) {
      return { success: false, message: "Erro ao atualizar funcionário" };
    }

    return {
      success: true,
      message: "Funcionário atualizado com sucesso",
    };
  } catch (error) {
    console.error("Error while updating employee:", error);
    return {
      success: false,
      message: "Erro interno no servidor. Tente novamente mais tarde.",
    };
  }
};
