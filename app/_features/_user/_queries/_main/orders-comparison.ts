import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

export type OrdersComparisonType = InferResponseType<
  (typeof client.api.orders.orderscomparison.store)[":storeId"]["$get"],
  200
>["data"];

export const getOrdersComparison = async (
  storeId: string
): Promise<OrdersComparisonType | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/orderscomparison/store/${storeId}`
    );

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching orders orders comparison:", error);
    throw error;
  }
};
