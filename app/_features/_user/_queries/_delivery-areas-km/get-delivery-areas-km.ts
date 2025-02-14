import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.deliveryareaskm.user)[":userId"]["$get"],
  200
>["data"];

const URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/deliveryareaskm/user`;

export const getDeliveryAreasKm = async (
  userId: string
): Promise<ResponseType | null> => {
  try {
    const res = await fetch(`${URL}/${userId}`);

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching delivery areas per km:", error);
    throw error;
  }
};
