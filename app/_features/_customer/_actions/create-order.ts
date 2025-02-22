"use server";

import { z } from "zod";
import { insertCustomerOrderSchema } from "@/db/schemas";
import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { orderItems, orders } from "@/db/schema";

export const createOrder = async (
  values: z.infer<typeof insertCustomerOrderSchema>
) => {
  console.log("values", values);
  try {
    const session = await auth();

    if (!session || !session.user.id) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const validatedValues = insertCustomerOrderSchema.safeParse(values);

    if (!validatedValues.success) {
      return { success: false, message: "Campos inválidos" };
    }

    const { price, product_id, quantity, user_id } = validatedValues.data;

    if (!price || !product_id || !quantity || !user_id) {
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
        payment_type: "CASH",
        type: "WEBSITE",
      })
      .returning({ id: orders.id });

    if (!order) {
      return { success: false, message: "Erro ao criar pedido" };
    }

    const orderItem = await db.insert(orderItems).values({
      order_id: order.id,
      product_id,
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
