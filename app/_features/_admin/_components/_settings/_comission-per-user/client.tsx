"use client";

import { columns } from "@/app/_features/_admin/_components/_settings/_comission-per-user/columns";
import { ComissionPerUserTable } from "@/app/_features/_admin/_components/_settings/_comission-per-user/comission-per-user-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetActiveUsers } from "@/app/_features/_admin/_queries/use-get-active-users";

export const ComissionPerUserClient = () => {
  const { data: users } = useGetActiveUsers();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comissão por usuário</CardTitle>
        <CardDescription>
          Na tabela abaixo você pode definir a comissão para cada usuário. Caso
          ele não possua comissão definida, será aplicado a ele a comissão geral
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ComissionPerUserTable
          data={users || []}
          columns={columns}
          searchKey="name"
        />
      </CardContent>
    </Card>
  );
};
