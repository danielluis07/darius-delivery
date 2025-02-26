"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CircleDollarSign } from "lucide-react";

export const TotalRevenue = ({ totalRevenue }: { totalRevenue: number }) => {
  return (
    <Card className="flex items-center gap-4 w-full">
      <CircleDollarSign className="w-8 h-8 text-primary" />
      <CardContent className="p-0">
        <p className="text-sm text-gray-500">Total de Receitas</p>
        <p className="text-xl font-bold">R$ {totalRevenue}</p>
      </CardContent>
    </Card>
  );
};
