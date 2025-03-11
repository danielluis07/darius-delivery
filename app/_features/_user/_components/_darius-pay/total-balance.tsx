"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ReceiptText } from "lucide-react";

export const TotalBalance = ({
  totalBalance,
}: {
  totalBalance: string | null;
}) => {
  return (
    <Card className="flex items-center gap-4 w-full h-56">
      <ReceiptText className="w-8 h-8 text-primary" />
      <CardContent className="p-0">
        <p className="text-sm text-gray-500">Valor Total</p>
        <p className="text-xl font-bold">{formatCurrency(totalBalance || 0)}</p>
      </CardContent>
    </Card>
  );
};
