"use server";

import { auth } from "@/auth";
import { requestAsaastAnticipation } from "@/lib/asaas";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export const requestAnticipation = async (paymentId: string) => {
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
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

    const { success, message } = await requestAsaastAnticipation(
      user.apiKey,
      paymentId
    );

    if (!success) {
      return {
        success: false,
        message,
      };
    }

    return {
      success: true,
      message: "Solicitação de antecipação efetuada com sucesso!",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro ao solicitar antecipação. Tente novamente mais tarde",
    };
  }
};
