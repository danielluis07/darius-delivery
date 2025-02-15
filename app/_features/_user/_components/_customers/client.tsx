"use client";

import { columns } from "@/app/_features/_user/_components/_customers/columns";
import { CustomersDataTable } from "@/app/_features/_user/_components/_customers/data-table";
import { useDeleteCustomers } from "@/app/_features/_user/_queries/_customers/use-delete-customers";
import { useGetCustomers } from "../../_queries/_customers/use-get-customers";

export const CustomersClient = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetCustomers(userId);
  const { mutate } = useDeleteCustomers();

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-10">Clientes</h1>
      <CustomersDataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        onDelete={(row) => {
          const ids = row.map((r) => r.original.id);
          mutate({ ids });
        }}
        searchKey="name"
      />
    </div>
  );
};
