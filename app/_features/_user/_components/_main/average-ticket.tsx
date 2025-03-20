"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyFromCents } from "@/lib/utils";
import { Banknote } from "lucide-react";

export const AverageTicket = ({
  averageTicket,
}: {
  averageTicket: number | null;
}) => {
  return (
    <Card className="flex items-center gap-4 w-full">
      <Banknote className="w-8 h-8 text-primary" />
      <CardContent className="p-0">
        <p className="text-sm text-gray-500">Ticket Médio</p>
        <p className="text-xl font-bold">
          {formatCurrencyFromCents(averageTicket || 0)}
        </p>
      </CardContent>
    </Card>
  );
};
