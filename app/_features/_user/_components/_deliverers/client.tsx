"use client";

import { columns } from "@/app/_features/_user/_components/_deliverers/columns";
import { DeliverersDataTable } from "@/app/_features/_user/_components/_deliverers/data-table";
import { useGetDeliverers } from "@/app/_features/_user/_queries/_deliverers/use-get-deliverers";
import { useDeleteDeliverers } from "@/app/_features/_user/_queries/_deliverers/use-delete-deliverers";
import { DeliverersForm } from "@/app/_features/_user/_components/_deliverers/deliverers-form";

export const DeliverersClient = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetDeliverers(userId);
  const { mutate } = useDeleteDeliverers();

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-10">Entregadores</h1>
      <DeliverersForm isLoading={isLoading} />
      <DeliverersDataTable
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
