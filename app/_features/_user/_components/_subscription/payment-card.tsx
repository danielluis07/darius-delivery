"use client";

import { CreditCard } from "./credit-card";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Boleto } from "./boleto";
import { Pix } from "./pix";

export const PaymentCard = () => {
  const searchParams = useSearchParams();
  const value = searchParams.get("value") as "BASIC" | "PREMIUM";
  const price = searchParams.get("price") as string;

  return (
    <Card className="w-[450px] space-y-2">
      <CardHeader>
        <CardTitle className="text-center">Forma de pagamento</CardTitle>
      </CardHeader>
      <CreditCard value={value} price={price} />
      <Boleto value={value} price={price} />
      <Pix value={value} price={price} />
    </Card>
  );
};
