"use client";

import { columns } from "@/app/_features/_user/_components/_orders/columns";

import { Card } from "@/components/ui/card";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { OrdersDataTable } from "@/app/_features/_user/_components/_orders/data-table";

type ResponseType = InferResponseType<
  (typeof client.api.orders.user)[":userId"]["$get"],
  200
>["data"];

type OrdersProps = {
  data: ResponseType;
};

export const OrdersClient = ({ data }: OrdersProps) => {
  return (
    <OrdersDataTable
      columns={columns}
      data={data}
      onDelete={() => {}}
      searchKey="status"
    />
  );
};
