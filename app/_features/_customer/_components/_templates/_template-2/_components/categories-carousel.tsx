"use client";

import { useGetCategories } from "@/app/_features/_customer/_queries/use-get-categories";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/context/store-context";

const categories = [
  {
    id: "1",
    userId: "1",
    name: "Categoria 1",
    image: "https://example.com/image1.jpg",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    userId: "1",
    name: "Categoria 2",
    image: "https://example.com/image2.jpg",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "3",
    userId: "1",
    name: "Categoria 3",
    image: "https://example.com/image3.jpg",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "4",
    userId: "1",
    name: "Categoria 4",
    image: "https://example.com/image4.jpg",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "5",
    userId: "1",
    name: "Categoria 5",
    image: "https://example.com/image5.jpg",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "6",
    userId: "1",
    name: "Categoria 6",
    image: "https://example.com/image6.jpg",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "7",
    userId: "1",
    name: "Categoria 7",
    image: "https://example.com/image7.jpg",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "8",
    userId: "1",
    name: "Categoria 8",
    image: "https://example.com/image8.jpg",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "9",
    userId: "1",
    name: "Categoria 9",
    image: "https://example.com/image9.jpg",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "10",
    userId: "1",
    name: "Categoria 10",
    image: "https://example.com/image10.jpg",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export const CategoriesCarousel = () => {
  const { data } = useStore();
  // const { data: categories, isLoading } = useGetCategories(data?.userId);

  const isLoading = false;

  return (
    <Carousel
      opts={{
        align: "start",
        dragFree: true,
      }}
      className="w-full">
      <CarouselContent className="-ml-3">
        {isLoading &&
          Array.from({ length: 20 }).map((_, index) => (
            <CarouselItem key={index} className="pl-3 basis-auto">
              <Skeleton className="rounded-lg px-3 py-2 w-[100px] whitespace-nowrap">
                &nbsp;
              </Skeleton>
            </CarouselItem>
          ))}
        {!isLoading &&
          categories?.map((item, i) => (
            <CarouselItem
              key={i}
              className="pl-3 basis-auto pr-2 py-3 cursor-pointer">
              <p className="font-semibold">{item.name}</p>
            </CarouselItem>
          ))}
      </CarouselContent>
    </Carousel>
  );
};
