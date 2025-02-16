"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { orders, orderItems } from "@/db/schema";
import { insertOrderSchema } from "@/db/schemas";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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

    const {
      productId,
      customer_id,
      price,
      quantity,
      status,
      type,
      payment_status,
    } = validatedValues.data;

    if (
      !productId ||
      !price ||
      !quantity ||
      !status ||
      !type ||
      !payment_status
    ) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const [order] = await db
      .insert(orders)
      .values({
        user_id: session.user.id,
        customer_id,
        total_price: price * quantity,
        type,
        status,
        payment_status,
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

    revalidatePath("/dashboard/orders");
    return {
      success: true,
      message: "Pedido criado com sucesso!",
      url: "/dashboard/orders",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro inserperado ao efetuar o pedido" };
  }
};
