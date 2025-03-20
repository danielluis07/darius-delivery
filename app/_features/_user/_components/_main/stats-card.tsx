"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

type StatsCardProps = {
  title: string;
  icon: React.ReactNode;
  value: number;
  className?: string;
};

export const StatsCard = ({
  title,
  icon,
  value,
  className,
}: StatsCardProps) => {
  return (
    <Card className="flex flex-col items-center justify-center gap-y-3 p-4 pb-12 relative overflow-hidden">
      <CardTitle className="text-lg font-bold mb-1 z-10">{title}</CardTitle>
      <div className="text-green-500 text-3xl z-10">{icon}</div>
      <p className="font-semibold z-10">{value} pessoas</p>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-secondary skew-y-6 transform origin-bottom-left",
          className
        )}
      />
    </Card>
  );
};
