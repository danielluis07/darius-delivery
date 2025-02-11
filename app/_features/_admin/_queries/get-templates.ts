import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<
  typeof client.api.templates.$get,
  200
>["data"];

const URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/templates`;

export const getTemplates = async (): Promise<ResponseType | null> => {
  try {
    const res = await fetch(URL);

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};
