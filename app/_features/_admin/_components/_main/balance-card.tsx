"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CircleDollarSign } from "lucide-react";

export const BalanceCard = ({ balance }: { balance: number }) => {
  return (
    <Card className="flex items-center gap-4 w-full">
      <CircleDollarSign className="w-8 h-8 text-primary" />
      <CardContent className="p-0">
        <p className="text-sm text-gray-500">Receita Total</p>
        <p className="text-xl font-bold">R$ {balance}</p>
      </CardContent>
    </Card>
  );
};
