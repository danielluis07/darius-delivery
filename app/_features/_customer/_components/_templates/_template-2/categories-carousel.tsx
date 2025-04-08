"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type Categories = InferResponseType<
  (typeof client.api.categories)[":userId"]["$get"],
  200
>["data"];

export const CategoriesCarousel = ({
  data,
  isLoading,
}: {
  data: Categories | undefined;
  isLoading: boolean;
}) => {
  if (isLoading) {
    <Skeleton className="w-full h-14" />;
  }
  return (
    <Carousel
      opts={{
        align: "start",
        dragFree: true,
      }}
      className="w-full">
      <CarouselContent className="-ml-3">
        {data?.map((item, i) => (
          <CarouselItem key={i} className="pl-3 basis-auto border pr-2 py-3">
            <p>{item.name}</p>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
