"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { requestWithdrawlSchema } from "@/db/schemas";
import { requesAsaastWithDrawl } from "@/lib/asaas";

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
      return { success: false, message: "Campos obrigatórios estão faltando" };
    }

    const { success, message } = await requesAsaastWithDrawl({
      value: Number(value),
      bankAccount,
      bankAgency,
      bankCode,
      cpfCnpj,
      bankAccountDigit,
      bankAccountType,
      ownerName,
      pixAddressKey,
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
