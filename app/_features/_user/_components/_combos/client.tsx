"use client";

import { columns } from "@/app/_features/_user/_components/_combos/columns";

import { Card } from "@/components/ui/card";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { CombosDataTable } from "@/app/_features/_user/_components/_combos/data-table";

type ResponseType = InferResponseType<
  (typeof client.api.combos.user)[":userId"]["$get"],
  200
>["data"];

type CombosProps = {
  data: ResponseType;
};

export const CombosClient = ({ data }: CombosProps) => {
  /* Create category dialog */

  return (
    <Card className="w-full">
      <h1 className="text-xl font-bold">Categorias</h1>
      <CombosDataTable
        columns={columns}
        data={data}
        onDelete={() => {}}
        searchKey="name"
      />
    </Card>
  );
};
