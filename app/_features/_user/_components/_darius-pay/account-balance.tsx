"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ReceiptText } from "lucide-react";

export const AccountBalance = ({ balance }: { balance: number }) => {
  return (
    <Card className="flex items-center gap-4 w-full h-56">
      <ReceiptText className="w-8 h-8 text-primary" />
      <CardContent className="p-0">
        <p className="text-sm text-gray-500">Saldo Disponível</p>
        <p className="text-xl font-bold">R$ {balance}</p>
      </CardContent>
    </Card>
  );
};
