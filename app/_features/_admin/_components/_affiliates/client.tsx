"use client";

import { AffiliatesDataTable } from "@/app/_features/_admin/_components/_affiliates/data-table";
import { columns } from "@/app/_features/_admin/_components/_affiliates/columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useGetAffiliates } from "../../_queries/use-get-affiliates";

export const AffiliatesClient = () => {
  const { data, isPending } = useGetAffiliates();
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Afiliados</CardTitle>
          <Link href="/admin/affiliates/new">
            <Button>
              Adicionar Afiliado <Plus />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <AffiliatesDataTable
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
