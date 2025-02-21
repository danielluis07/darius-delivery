"use server";

import { z } from "zod";
import { db } from "@/db/drizzle";
import { orders, orderItems, receipts } from "@/db/schema";
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

    const { customer_id, status, type, payment_status, items, payment_type } =
      validatedValues.data;

    if (
      !customer_id ||
      !status ||
      !type ||
      !payment_status ||
      !payment_type ||
      !items.length
    ) {
      return { success: false, message: "Campos obrigatórios não preenchidos" };
    }

    const total_price = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const [order] = await db
      .insert(orders)
      .values({
        user_id: session.user.id,
        customer_id,
        total_price,
        type,
        status,
        payment_status,
        payment_type,
      })
      .returning({ id: orders.id });

    if (!order) {
      return { success: false, message: "Erro ao criar pedido" };
    }

    await db.insert(orderItems).values(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        price: item.price,
        quantity: item.quantity,
      }))
    );

    const receipt = await db.insert(receipts).values({
      order_id: order.id,
      user_id: session.user.id,
    });

    if (!receipt) {
      return { success: false, message: "Erro ao criar a comanda" };
    }

    revalidatePath("/dashboard/orders");
    return {
      success: true,
      message: "Pedido criado com sucesso!",
      url: "/dashboard/orders",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro inesperado ao efetuar o pedido" };
  }
};
