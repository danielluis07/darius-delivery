"use client";

import { columns } from "@/app/_features/_user/_components/_combos/columns";

import { Card } from "@/components/ui/card";
import { CombosDataTable } from "@/app/_features/_user/_components/_combos/data-table";
import { useGetCombos } from "../../_queries/_combos/use-get-combos";
import { useDeleteCombos } from "../../_queries/_combos/use-delete-combos";

export const CombosClient = ({ storeId }: { storeId: string }) => {
  const { data, isLoading } = useGetCombos(storeId);
  const deleteCombos = useDeleteCombos(storeId);

  return (
    <Card className="w-full">
      <h1 className="text-xl font-bold">Combos</h1>
      <CombosDataTable
        columns={columns}
        data={data || []}
        storeId={storeId}
        isLoading={isLoading}
        onDelete={(row) => {
          const ids = row.map((r) => r.original.id);
          deleteCombos.mutate(ids);
        }}
        searchKey="name"
      />
    </Card>
  );
};
