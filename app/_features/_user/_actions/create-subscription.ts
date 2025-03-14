"use server";

import { z } from "zod";
import { auth, unstable_update } from "@/auth";
import { db } from "@/db/drizzle";
import { subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createAsaasSubscription } from "@/lib/asaas";
import { creditCardSchema } from "@/app/_features/_user/_components/_subscription/confirmation-card";
import { addDays, format } from "date-fns";

export const createSubscription = async (
  values: z.infer<typeof creditCardSchema>,
  subscriptionPrice: number,
  subscriptionType: "BASIC" | "PREMIUM"
) => {
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    const [user] = await db
      .select({ customerId: users.userCustomerId })
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user || !user.customerId) {
      return { success: false, message: "Usuário não encontrado" };
    }

    const nextDueDate = format(addDays(new Date(), 15), "yyyy-MM-dd");

    const { success, id, message, status } = await createAsaasSubscription(
      values,
      subscriptionPrice,
      subscriptionType,
      user.customerId,
      nextDueDate
    );

    if (!success) {
      return { success, message };
    }

    const subscription = await db.insert(subscriptions).values({
      asaas_sub_id: id,
      user_id: session.user.id,
      status,
      plan: subscriptionType,
    });

    if (!subscription) {
      return {
        success: false,
        message: "Erro inesperado ao criar a assinatura",
      };
    }

    const updatedUser = await db
      .update(users)
      .set({
        creditCardholderName: values.holderName,
        creditCardnumber: values.number,
        creditCardexpiryMonth: values.expiryMonth,
        creditCardexpiryYear: values.expiryYear,
        creditCardccv: values.ccv,
        isSubscribed: true,
        trialEndsAt: addDays(new Date(), 15),
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
        isSubscribed: true,
      },
    });

    return {
      success: true,
      message: "Assinatura criada com sucesso",
      callbackUrl: "/dashboard",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao criar a customização",
    };
  }
};
