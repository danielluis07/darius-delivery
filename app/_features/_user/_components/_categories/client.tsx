"use client";

import { CategoriesDataTable } from "@/app/_features/_user/_components/_categories/data-table";
import { columns } from "@/app/_features/_user/_components/_categories/columns";
import { Card } from "@/components/ui/card";
import { useGetCategories } from "../../_queries/_categories/use-get-categories";
import { useDeleteCategories } from "../../_queries/_categories/use-delete-categories";

export const CategoriesClient = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useGetCategories(userId);
  const deleteCategories = useDeleteCategories(userId);

  return (
    <Card className="w-full">
      <h1 className="text-xl font-bold">Categorias</h1>
      <CategoriesDataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        onDelete={(row) => {
          const ids = row.map((r) => r.original.id);
          deleteCategories.mutate(ids);
        }}
        searchKey="name"
      />
    </Card>
  );
};
