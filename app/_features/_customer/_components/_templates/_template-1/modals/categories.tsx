"use client";

import { useGetCategories } from "@/app/_features/_customer/_queries/use-get-categories";
import { Card } from "@/components/ui/card";
import { useStore } from "@/context/store-context";
import { useModalStore } from "@/hooks/use-modal-store";

export const Categories = () => {
  const { data } = useStore();
  const { onOpen } = useModalStore();
  const { data: categories, isLoading } = useGetCategories(data?.userId);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      {categories?.map((category, i) => (
        <Card
          key={i}
          className="flex flex-col items-center min-w-28 cursor-pointer"
          style={{
            backgroundColor: data?.customization.button_color || "white",
            color: data?.customization.font_color || "black",
          }}
          onClick={() => onOpen("products", category.id)}>
          {category.name}
        </Card>
      ))}
    </div>
  );
};
