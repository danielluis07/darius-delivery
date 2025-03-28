import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.users.employee)[":employeeId"]["$get"],
  200
>["data"];

const URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/users/employee`;

export const getEmployee = async (
  employeeId: string
): Promise<ResponseType | null> => {
  try {
    const res = await fetch(`${URL}/${employeeId}`);

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching employee:", error);
    throw error;
  }
};
