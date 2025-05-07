"use client";

import { useGetEmployees } from "@/app/_features/_user/_queries/_employees/use-get-employees";
import { EmployeesDataTable } from "@/app/_features/_user/_components/_employee/data-table";
import { columns } from "@/app/_features/_user/_components/_employee/columns";
import { Card } from "@/components/ui/card";

export const EmployeesClient = ({ storeId }: { storeId: string }) => {
  const { data, isPending } = useGetEmployees(storeId);
  return (
    <Card>
      <h1 className="text-xl font-bold">Funcionários</h1>
      <EmployeesDataTable
        data={data || []}
        columns={columns}
        storeId={storeId}
        isLoading={isPending}
        onDelete={() => {}}
        searchKey="name"
      />
    </Card>
  );
};
