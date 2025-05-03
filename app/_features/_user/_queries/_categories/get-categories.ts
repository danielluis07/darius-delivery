import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type Categories = InferResponseType<
  (typeof client.api.categories.user)[":userId"]["$get"],
  200
>["data"];

type CategoriesWithProducts = InferResponseType<
  (typeof client.api.categories)["with-products"]["user"][":userId"]["$get"],
  200
>["data"];

const URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/categories/user`;

export const getCategories = async (
  userId: string
): Promise<Categories | null> => {
  try {
    const res = await fetch(`${URL}/${userId}`);

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getCategoriesWithProducts = async (
  userId: string
): Promise<CategoriesWithProducts | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/categories/with-products/user/${userId}`
    );

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories with products:", error);
    throw error;
  }
};
