"use client";

import { columns } from "@/app/_features/_user/_components/_products/columns";
import { ProductsDataTable } from "@/app/_features/_user/_components/_products/data-table";
import { useGetProducts } from "../../_queries/_products/use-get-products";
import { useDeleteProducts } from "../../_queries/_products/use-delete-products";

export const ProductsClient = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetProducts(userId);
  const deleteProducts = useDeleteProducts(userId);

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold">Produtos</h1>
      <ProductsDataTable
        columns={columns}
        data={data || []}
        onDelete={(row) => {
          const ids = row.map((r) => r.original.id);
          deleteProducts.mutate(ids);
        }}
        isLoading={isLoading}
        searchKey="name"
      />
    </div>
  );
};
