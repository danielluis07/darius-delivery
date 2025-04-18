"use client";

import { useModalStore } from "@/hooks/use-modal-store";
import { useGetCategories } from "@/app/_features/_customer/_queries/use-get-categories";
import { useStore } from "@/context/store-context";
import placeholder from "@/public/placeholder-image.jpg";

export const Menu = () => {
  const { data } = useStore();
  const { onOpen } = useModalStore();
  const { data: categories, isLoading } = useGetCategories(data?.userId);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      {categories?.map((category, i) => (
        <div
          key={i}
          className="relative flex flex-col items-center justify-center min-w-28 h-28 cursor-pointer font-semibold overflow-hidden rounded-lg"
          style={{
            color: data?.customization.font_color || "black",
          }}
          onClick={() => onOpen("products", category.id)}>
          <div
            className="absolute inset-0 bg-cover bg-center brightness-50"
            style={{
              backgroundImage: `url(${category.image || placeholder.src})`,
            }}
          />

          <div className="relative z-10 text-center text-xl">
            {category.name}
          </div>
        </div>
      ))}
    </div>
  );
};
