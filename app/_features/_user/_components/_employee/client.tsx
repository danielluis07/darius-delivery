"use client";

import { useGetEmployees } from "@/app/_features/_user/_queries/_employees/use-get-employees";
import { EmployeesDataTable } from "@/app/_features/_user/_components/_employee/data-table";
import { columns } from "@/app/_features/_user/_components/_employee/columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const EmployeesClient = ({ userId }: { userId: string }) => {
  const { data, isPending } = useGetEmployees(userId);
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Funcionários</CardTitle>
          <Link href="/dashboard/employees/new">
            <Button>
              Adicionar funcionário <Plus />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <EmployeesDataTable
          data={data || []}
          columns={columns}
          isLoading={isPending}
          onDelete={() => {}}
          searchKey="name"
        />
      </CardContent>
    </Card>
  );
};
