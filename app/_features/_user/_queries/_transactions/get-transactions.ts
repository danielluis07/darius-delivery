import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type TransactionsType = InferResponseType<
  (typeof client.api.transactions.store)[":storeId"]["$get"],
  200
>["data"];

type TotalRevenueType = InferResponseType<
  (typeof client.api.transactions.totalrevenue.store)[":storeId"]["$get"],
  200
>["data"];

export const getTransactions = async (
  storeId: string
): Promise<TransactionsType | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/transactions/store/${storeId}`
    );

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const getTotalRevenue = async (
  storeId: string
): Promise<TotalRevenueType | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/transactions/totalrevenue/store/${storeId}`
    );

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching total revenue:", error);
    throw error;
  }
};
