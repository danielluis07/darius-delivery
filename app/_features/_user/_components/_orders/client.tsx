"use client";

import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.orders.user)[":userId"]["$get"],
  200
>["data"];

type OrdersProps = {
  data: ResponseType;
};

export const OrdersClient = ({ data }: OrdersProps) => {
  console.log(data);
  return (
    <div>
      <p>orders</p>
    </div>
  );
};
