"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const NewOrderSkeleton = () => {
  return (
    <div className="flex items-center gap-5 h-[300px]">
      <div className="flex flex-col justify-between size-full">
        <div className="space-y-3">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-[300px] h-10" />
        </div>
        <div className="space-y-3">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-[300px] h-10" />
        </div>
        <div className="space-y-3">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-[300px] h-10" />
        </div>
      </div>
      <div className="flex flex-col justify-between size-full">
        <div className="space-y-3">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-full h-10" />
        </div>
        <div className="space-y-3">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-full h-10" />
        </div>
        <div className="space-y-3">
          <Skeleton className="w-16 h-5" />
          <Skeleton className="w-full h-10" />
        </div>
      </div>
    </div>
  );
};
