"use client";

import { useStore } from "@/context/store-context";
import placeholder from "@/public/placeholder-image.jpg";
import Image from "next/image";
import { useGetCategories } from "../../../_queries/use-get-categories";
import { CategoriesCarousel } from "./categories-carousel";

export const MainClient = () => {
  const { data } = useStore();
  const { data: categories, isLoading } = useGetCategories(data?.userId);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative w-full h-96">
        <Image
          src={data?.customization.banner || placeholder}
          alt="banner"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          className="object-cover"
        />
      </div>
      <CategoriesCarousel data={categories} isLoading={isLoading} />
    </div>
  );
};
