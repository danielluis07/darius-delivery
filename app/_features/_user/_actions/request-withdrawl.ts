"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { requestWithdrawlSchema } from "@/db/schemas";
import { requestAsaastWithDrawl } from "@/lib/asaas";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export const requestWithDrawl = async (
  values: z.infer<typeof requestWithdrawlSchema>
) => {
  try {
    const session = await auth();
    const validatedValues = requestWithdrawlSchema.safeParse(values);

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const {
      value,
      bankAccount,
      bankAccountDigit,
      bankAccountType,
      cpfCnpj,
      bankAgency,
      bankCode,
      ownerName,
      pixAddressKey,
    } = validatedValues.data;

    if (
      !value ||
      !bankAccount ||
      !bankAccountDigit ||
      !bankAccountType ||
      !cpfCnpj ||
      !bankAgency ||
      !bankCode ||
      !ownerName
    ) {
      return {
        success: false,
        message: "Preencha suas informações bancárias primeiro",
      };
    }

    const [user] = await db
      .select({ apiKey: users.asaasApiKey })
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user || !user.apiKey) {
      return {
        success: false,
        message: "Usuário não possui os dados necessários",
      };
    }

    const { success, message } = await requestAsaastWithDrawl({
      value: Number(value),
      bankAccount,
      bankAgency,
      bankCode,
      cpfCnpj,
      bankAccountDigit,
      bankAccountType,
      ownerName,
      pixAddressKey,
      apiKey: user.apiKey,
    });

    if (!success) {
      return {
        success: false,
        message,
      };
    }

    return {
      success: true,
      message: "Solicitação de saque efetuada com sucesso!",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro ao requisitar saque. Tente novamente mais tarde",
    };
  }
};
