"use client";

import { columns } from "@/app/_features/_user/_components/_additionals/columns";
import { useGetAdditionals } from "@/app/_features/_user/_queries/_additionals/use-get-additionals";
import { AdditionalsDataTable } from "@/app/_features/_user/_components/_additionals/data-table";
import { useDeleteAdditionals } from "../../_queries/_additionals/use-delete-additionals";

export const AdditionalsClient = ({ storeId }: { storeId: string }) => {
  const { data, isLoading } = useGetAdditionals(storeId);
  const { mutate } = useDeleteAdditionals(storeId);

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold">Adicionais</h1>
      <AdditionalsDataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        storeId={storeId}
        onDelete={(row) => {
          const ids = row.map((r) => r.original.id);
          mutate(ids);
        }}
        searchKey="name"
      />
    </div>
  );
};
