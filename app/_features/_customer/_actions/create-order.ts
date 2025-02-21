"use server";

import { z } from "zod";
import { insertOrderSchema } from "@/db/schemas";
import { auth } from "@/auth";

export const createOrder = async (
  values: z.infer<typeof insertOrderSchema>
) => {
  console.log("values", values);
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return { success: false, message: "Usuário não autenticado" };
    }

    return {
      success: false,
      message: "Essa funcionalidade ainda não está disponível",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro inserperado ao efetuar o pedido" };
  }
};
