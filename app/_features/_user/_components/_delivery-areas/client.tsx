"use client";

import { columns } from "@/app/_features/_user/_components/_delivery-areas/columns";
import { DeliveryAreasDataTable } from "@/app/_features/_user/_components/_delivery-areas/data-table";
import { useGetDeliveryAreas } from "@/app/_features/_user/_queries/_delivery-areas/use-get-delivery-areas";
import { DeliveryAreasForm } from "@/app/_features/_user/_components/_delivery-areas/delivery-areas-form";
import { useDeleteDeliveryAreas } from "@/app/_features/_user/_queries/_delivery-areas/use-delete-delivery-areas";

export const DeliveryAreasClient = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetDeliveryAreas(userId);
  const { mutate } = useDeleteDeliveryAreas();

  return (
    <div className="w-full">
      <h1 className="text-xl font-bold mb-10">Áreas de entrega</h1>
      <DeliveryAreasForm isLoading={isLoading} />
      <DeliveryAreasDataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        onDelete={(row) => {
          const ids = row.map((r) => r.original.id);
          mutate({ ids });
        }}
        searchKey="city"
      />
    </div>
  );
};
