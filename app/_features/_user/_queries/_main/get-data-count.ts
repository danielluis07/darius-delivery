import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type OrdersCountType = InferResponseType<
  (typeof client.api.orders.count.store)[":storeId"]["$get"],
  200
>["data"];

type CategoriesCountType = InferResponseType<
  (typeof client.api.categories.count.store)[":storeId"]["$get"],
  200
>["data"];

type ProductsCountType = InferResponseType<
  (typeof client.api.products.count.store)[":storeId"]["$get"],
  200
>["data"];

export const getOrdersCount = async (
  storeId: string
): Promise<OrdersCountType | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/count/store/${storeId}`
    );

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching orders count:", error);
    throw error;
  }
};

export const getCategoriesCount = async (
  storeId: string
): Promise<CategoriesCountType | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/categories/count/store/${storeId}`
    );

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories count:", error);
    throw error;
  }
};

export const getProductsCount = async (
  storeId: string
): Promise<ProductsCountType | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/count/store/${storeId}`
    );

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching products count:", error);
    throw error;
  }
};
