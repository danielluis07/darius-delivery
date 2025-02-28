"use client";

import { columns } from "@/app/_features/_admin/_components/_users/columns";
import { UsersDataTable } from "@/app/_features/_admin/_components/_users/data-table";
import { useDeleteDeliverers } from "@/app/_features/_user/_queries/_deliverers/use-delete-deliverers";
import { useGetUsers } from "@/app/_features/_admin/_queries/use-get-users";

export const UsersClient = () => {
  const { data, isLoading } = useGetUsers();
  const { mutate } = useDeleteDeliverers();

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-10">Lojistas</h1>
      <UsersDataTable
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
