"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface FilterCarouselProps {
  //value: string | null;
  //onChange: (value: string | null) => void;
  data:
    | {
        id: string;
        userId: string | null;
        name: string;
        image: string;
        createdAt: string | null;
        updatedAt: string | null;
      }[]
    | undefined;
}
[];

export const FilterCarousel = ({ data }: FilterCarouselProps) => {
  return (
    <div className="relative w-full border h-screen">
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
    </div>
  );
};
