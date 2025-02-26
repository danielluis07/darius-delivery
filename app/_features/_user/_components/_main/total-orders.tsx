"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ReceiptText } from "lucide-react";

export const TotalOrders = ({ totalOrders }: { totalOrders: number }) => {
  return (
    <Card className="flex items-center gap-4 w-full">
      <ReceiptText className="w-8 h-8 text-primary" />
      <CardContent className="p-0">
        <p className="text-sm text-gray-500">Total de Pedidos</p>
        <p className="text-xl font-bold">{totalOrders}</p>
      </CardContent>
    </Card>
  );
};
