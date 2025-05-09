import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.customizations.user)[":userId"]["$get"],
  200
>["data"];

const URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/customizations/user`;

export const getCustomization = async (
  userId: string
): Promise<ResponseType> => {
  try {
    const res = await fetch(`${URL}/${userId}`);

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching customization:", error);
    throw error;
  }
};
