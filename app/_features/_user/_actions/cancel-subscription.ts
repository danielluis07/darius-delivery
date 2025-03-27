"use server";

import { auth, unstable_update } from "@/auth";
import { db } from "@/db/drizzle";
import { subscriptions, users } from "@/db/schema";
import { cancelAsaasSubscription } from "@/lib/asaas";
import { eq } from "drizzle-orm";

export const cancelSubscription = async (
  subscriptionId: string | null | undefined
) => {
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!subscriptionId) {
      return { success: false, message: "Subscription ID is required" };
    }

    const { success, message } = await cancelAsaasSubscription(subscriptionId);

    if (!success) {
      return { success: false, message };
    }

    await db
      .delete(subscriptions)
      .where(eq(subscriptions.asaas_sub_id, subscriptionId));

    const updatedUser = await db
      .update(users)
      .set({
        isSubscribed: false,
      })
      .where(eq(users.id, session.user.id));

    if (!updatedUser) {
      return {
        success: false,
        message: "Erro inesperado ao atualizar o status do usuário",
      };
    }

    await unstable_update({
      user: {
        isSubscribed: false,
      },
    });

    return {
      success: true,
      message: "Assinatura cancelada com sucesso",
      callbackUrl: "/subscription",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao criar a customização",
    };
  }
};
