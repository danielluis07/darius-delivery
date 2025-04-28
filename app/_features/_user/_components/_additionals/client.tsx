"use client";

import { columns } from "@/app/_features/_user/_components/_additionals/columns";
import { useDeleteDeliverers } from "@/app/_features/_user/_queries/_deliverers/use-delete-deliverers";
import { useGetAdditionals } from "@/app/_features/_user/_queries/_additionals/use-get-additionals";
import { AdditionalsDataTable } from "@/app/_features/_user/_components/_additionals/data-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const AdditionalsClient = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetAdditionals(userId);
  const { mutate } = useDeleteDeliverers();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Adicionais</h1>
        <Link href="/dashboard/additionals/new">
          <Button>
            <Plus /> Criar Adicional
          </Button>
        </Link>
      </div>
      <AdditionalsDataTable
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
