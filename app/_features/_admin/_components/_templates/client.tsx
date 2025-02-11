"use client";

import { columns } from "@/app/_features/_admin/_components/_templates/columns";
import { Card } from "@/components/ui/card";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { TemplatesDataTable } from "@/app/_features/_admin/_components/_templates/data-table";

type ResponseType = InferResponseType<
  typeof client.api.templates.$get,
  200
>["data"];

type TemplatesProps = {
  data: ResponseType;
};

export const TemplatesClient = ({ data }: TemplatesProps) => {
  /* Create templates dialog */

  return (
    <Card className="w-full">
      <h1 className="text-xl font-bold">Templates</h1>
      <TemplatesDataTable
        columns={columns}
        data={data}
        onDelete={() => {}}
        searchKey="name"
      />
    </Card>
  );
};
