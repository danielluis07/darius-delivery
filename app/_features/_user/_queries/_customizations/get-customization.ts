import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.customizations.store)[":storeId"]["$get"],
  200
>["data"];

const URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/customizations/store`;

export const getCustomization = async (
  storeId: string
): Promise<ResponseType> => {
  try {
    const res = await fetch(`${URL}/${storeId}`);

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching customization:", error);
    throw error;
  }
};
