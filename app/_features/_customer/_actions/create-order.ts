"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { orders, orderItems } from "@/db/schema";
import { insertOrderSchema } from "@/db/schemas";
import { auth } from "@/auth";

export const createOrder = async (
  values: z.infer<typeof insertOrderSchema>
) => {
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const validatedValues = insertOrderSchema.safeParse(values);

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { productId, user_id, price, quantity } = validatedValues.data;

    if (!productId || !price || !quantity) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const [order] = await db
      .insert(orders)
      .values({
        user_id,
        customer_id: session.user.id,
        total_price: price * quantity,
        status: "PREPARING",
        payment_status: "PENDING",
      })
      .returning({ id: orders.id });

    if (!order) {
      return { success: false, message: "Erro ao criar pedido" };
    }

    const orderItem = await db.insert(orderItems).values({
      order_id: order.id,
      product_id: productId,
      price,
      quantity,
    });

    if (!orderItem) {
      return { success: false, message: "Erro ao criar item do pedido" };
    }

    return {
      success: true,
      message: "Pedido efetuado com sucesso!",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro inserperado ao efetuar o pedido" };
  }
};
