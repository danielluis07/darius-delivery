"use client";

import { columns } from "@/app/_features/_user/_components/_additionals/columns";
import { useGetAdditionals } from "@/app/_features/_user/_queries/_additionals/use-get-additionals";
import { AdditionalsDataTable } from "@/app/_features/_user/_components/_additionals/data-table";
import { useDeleteAdditionals } from "../../_queries/_additionals/use-delete-additionals";

export const AdditionalsClient = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetAdditionals(userId);
  const { mutate } = useDeleteAdditionals(userId);

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold">Adicionais</h1>
      <AdditionalsDataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        onDelete={(row) => {
          const ids = row.map((r) => r.original.id);
          mutate(ids);
        }}
        searchKey="name"
      />
    </div>
  );
};
