"use client";

import { columns } from "@/app/_features/_admin/_components/_users/columns";
import { UsersDataTable } from "@/app/_features/_admin/_components/_users/data-table";
import { useGetUsers } from "@/app/_features/_admin/_queries/use-get-users";

export const UsersClient = () => {
  const { data, isLoading } = useGetUsers();

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-10">Lojistas</h1>
      <UsersDataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        onDelete={() => {}}
        searchKey="name"
      />
    </div>
  );
};
