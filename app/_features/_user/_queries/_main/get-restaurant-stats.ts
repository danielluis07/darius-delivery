import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api)["restaurant-data"]["user"][":userId"]["$get"],
  200
>["data"];

export const getRestaurantStats = async (
  userId: string
): Promise<ResponseType | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/restaurant-data/user/${userId}`
    );

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    throw error;
  }
};
