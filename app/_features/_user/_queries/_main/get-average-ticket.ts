import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.finances)["average-ticket"][":userId"]["$get"],
  200
>["data"];

export const getAverageTicket = async (
  userId: string
): Promise<ResponseType | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/finances/average-ticket/${userId}`
    );

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching average ticket:", error);
    throw error;
  }
};
