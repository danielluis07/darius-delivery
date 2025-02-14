"use client";

import { columns } from "@/app/_features/_user/_components/_products/columns";

import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { ProductsDataTable } from "@/app/_features/_user/_components/_products/data-table";

type ResponseType = InferResponseType<
  (typeof client.api.products)[":userId"]["$get"],
  200
>["data"];

type ProductsProps = {
  data: ResponseType;
};

export const ProductsClient = ({ data }: ProductsProps) => {
  /* Create category dialog */

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold">Categorias</h1>
      <ProductsDataTable
        columns={columns}
        data={data}
        onDelete={() => {}}
        searchKey="name"
      />
    </div>
  );
};
