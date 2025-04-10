"use client";

import { CategoriesDataTable } from "@/app/_features/_user/_components/_categories/data-table";
import { columns } from "@/app/_features/_user/_components/_categories/columns";

import { Card } from "@/components/ui/card";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
  (typeof client.api.categories.user)[":userId"]["$get"],
  200
>["data"];

type CategoriesProps = {
  data: ResponseType;
};

export const CategoriesClient = ({ data }: CategoriesProps) => {
  /* Create category dialog */

  return (
    <Card className="w-full">
      <h1 className="text-xl font-bold">Categorias</h1>
      <CategoriesDataTable
        columns={columns}
        data={data}
        onDelete={() => {}}
        searchKey="name"
      />
    </Card>
  );
};
