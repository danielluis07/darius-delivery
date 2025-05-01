import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.orders.order)[":id"]["$get"],
  200
>["data"];

const URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/order`;

export const getOrder = async (id: string): Promise<ResponseType | null> => {
  try {
    const res = await fetch(`${URL}/${id}`);

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};
