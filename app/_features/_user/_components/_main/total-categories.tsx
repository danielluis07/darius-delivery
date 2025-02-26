"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Layers } from "lucide-react";

export const TotalCategories = ({
  totalCategories,
}: {
  totalCategories: number;
}) => {
  return (
    <Card className="flex items-center gap-4 w-full">
      <Layers className="w-8 h-8 text-primary" />
      <CardContent className="p-0">
        <p className="text-sm text-gray-500">Total de Categorias</p>
        <p className="text-xl font-bold">{totalCategories}</p>
      </CardContent>
    </Card>
  );
};
