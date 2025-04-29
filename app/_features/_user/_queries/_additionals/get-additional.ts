import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.additionals)[":id"]["$get"],
  200
>["data"];

const URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/additionals`;

export const getAdditional = async (
  id: string
): Promise<ResponseType | null> => {
  try {
    const res = await fetch(`${URL}/${id}`);

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching additional:", error);
    throw error;
  }
};
