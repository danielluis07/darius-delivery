import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.customizations.isOpen.store)[":storeId"]["$get"],
  200
>["data"];

const URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/customizations/isOpen/store`;

export const getIsRestaurantOpen = async (
  storeId: string
): Promise<ResponseType | null> => {
  try {
    const res = await fetch(`${URL}/${storeId}`);

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching customization data:", error);
    throw error;
  }
};
