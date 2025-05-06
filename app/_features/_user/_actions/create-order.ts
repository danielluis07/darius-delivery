"use server";

import { z } from "zod";
import { gte, lt, and, desc, eq } from "drizzle-orm"; // Replace "some-library" with the actual library name
import { db } from "@/db/drizzle";
import {
  orders,
  orderItems,
  receipts,
  customers,
  users,
  stores,
} from "@/db/schema";
import { insertOrderSchema } from "@/db/schemas";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { formatAddress, getGeoCode } from "@/lib/google-geocode";

export const createOrder = async (
  values: z.infer<typeof insertOrderSchema>
) => {
  try {
    const session = await auth();

    if (!session) {
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

    const [customer, user] = await Promise.all([
      db
        .select({
          city: customers.city,
          state: customers.state,
          neighborhood: customers.neighborhood,
          street: customers.street,
          street_number: customers.street_number,
          postalCode: customers.postalCode,
        })
        .from(customers)
        .where(eq(customers.id, customer_id))
        .then(([result]) => result), // Extracting first element

      db
        .select({ googleApiKey: stores.googleApiKey })
        .from(users)
        .innerJoin(stores, eq(users.id, stores.userId))
        .where(eq(users.id, ""))
        .then(([result]) => result), // Extracting first element
    ]);

    if (!customer || !user || !user.googleApiKey) {
      return { success: false, message: "Cliente ou usuário não encontrado" };
    }

    const formattedAddress = formatAddress({
      city: customer.city,
      state: customer.state,
      neighborhood: customer.neighborhood,
      street: customer.street,
      street_number: customer.street_number,
      postalCode: customer.postalCode,
    });

    const { success, latitude, longitude, message, placeId } = await getGeoCode(
      formattedAddress,
      user.googleApiKey
    );

    if (!success) {
      return { success: false, message };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Busca o último pedido do dia atual
    const lastOrder = await db
      .select({
        daily_number: orders.daily_number,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(and(gte(orders.createdAt, today), lt(orders.createdAt, tomorrow)))
      .orderBy(desc(orders.createdAt))
      .limit(1);

    const nextDailyNumber = lastOrder[0] ? lastOrder[0].daily_number + 1 : 1;

    const total_price = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const [order] = await db
      .insert(orders)
      .values({
        storeId: session.user.id,
        daily_number: nextDailyNumber,
        customer_id,
        total_price,
        latitude,
        longitude,
        placeId,
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
      storeId: session.user.id,
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
