"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { customizations } from "@/db/schema";
import { eq } from "drizzle-orm";

const formSchema = z.object({
  isOpen: z.boolean(),
});

export const openRestaurant = async (values: z.infer<typeof formSchema>) => {
  console.log("values", values);
  try {
    const session = await auth();
    const validatedValues = formSchema.safeParse(values);

    if (!session || !session.user.id) {
      return { success: false, message: "Not authenticated" };
    }

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { isOpen } = validatedValues.data;

    const userId = session.user.id;

    const existingCustomization = await db
      .update(customizations)
      .set({
        isOpen,
      })
      .where(eq(customizations.user_id, userId));

    if (!existingCustomization) {
      return {
        success: false,
        message: "Erro ao abrir/fechar a loja",
      };
    }

    return {
      success: true,
      message: "Loja atualizada com sucesso",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erro inesperado ao processar os pixels",
    };
  }
};
