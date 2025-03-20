import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

export type OrdersComparisonType = InferResponseType<
  (typeof client.api.orders.orderscomparison)[":userId"]["$get"],
  200
>["data"];

export const getOrdersComparison = async (
  userId: string
): Promise<OrdersComparisonType | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/orderscomparison/${userId}`
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
