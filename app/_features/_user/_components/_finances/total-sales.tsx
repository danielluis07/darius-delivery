"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export const TotalSales = ({ totalSales }: { totalSales: number }) => {
  return (
    <Card className="flex items-center gap-4 w-full h-28">
      <ShoppingCart className="w-8 h-8 text-primary" />
      <CardContent className="p-0">
        <p className="text-sm text-gray-500">Total de Vendas</p>
        <p className="text-xl font-bold">{totalSales}</p>
      </CardContent>
    </Card>
  );
};
