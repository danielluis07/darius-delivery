"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

export const TotalProducts = ({
  totalProducts,
}: {
  totalProducts: { count: number } | null;
}) => {
  return (
    <Card className="flex items-center gap-4 w-full">
      <Package className="w-8 h-8 text-primary" />
      <CardContent className="p-0">
        <p className="text-sm text-gray-500">Total de Produtos</p>
        <p className="text-xl font-bold">{totalProducts?.count || 0}</p>
      </CardContent>
    </Card>
  );
};
