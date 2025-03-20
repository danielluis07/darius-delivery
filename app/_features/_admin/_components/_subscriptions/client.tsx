"use client";

import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import { SubscriptionsDataTable } from "@/app/_features/_admin/_components/_subscriptions/data-table";
import { columns } from "@/app/_features/_admin/_components/_subscriptions/columns";

type ResponseType = InferResponseType<
  typeof client.api.admin.subscriptions.$get,
  200
>["data"];

export const SubscriptionsClient = ({ data }: { data: ResponseType }) => {
  return (
    <SubscriptionsDataTable
      columns={columns}
      data={data || []}
      onDelete={() => {}}
      searchKey="name"
    />
  );
};
