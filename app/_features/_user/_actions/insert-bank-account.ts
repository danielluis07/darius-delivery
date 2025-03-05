"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { insertBankAccountSchema } from "@/db/schemas";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { createPixKey } from "@/lib/asaas";

export const insertBankAccount = async (
  values: z.infer<typeof insertBankAccountSchema>
) => {
  try {
    const session = await auth();
    const validatedValues = insertBankAccountSchema.safeParse(values);

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const {
      bankAccount,
      bankAccountDigit,
      bankAccountType,
      bankAgency,
      bankCode,
      ownerName,
    } = validatedValues.data;

    if (
      !bankAccount ||
      !bankAccountDigit ||
      !bankAccountType ||
      !bankAgency ||
      !bankCode ||
      !ownerName
    ) {
      return { success: false, message: "Campos obrigatórios estão faltando" };
    }

    const { success, message, pixKey } = await createPixKey();

    if (!success) {
      return { message };
    }

    const data = await db
      .update(users)
      .set({
        bankAccount,
        bankAccountDigit,
        bankAccountType,
        bankAgency,
        bankCode,
        ownerName,
        pixAddressKey: pixKey,
      })
      .where(eq(users.id, session.user.id));

    if (!data) {
      return {
        success: false,
        message: "Falha ao criar salvar os dados bancários",
      };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, message: "Dados bancários salvos com sucesso!" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro ao salvar os dados bancários",
    };
  }
};
