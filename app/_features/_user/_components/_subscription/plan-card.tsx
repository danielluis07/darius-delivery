"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  value: "BASIC" | "PREMIUM";
  name: string;
  price: number;
  description: string;
};

export const PlanCard = ({ plan }: { plan: Plan }) => {
  const router = useRouter();
  return (
    <Card className="text-center">
      <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
      <p className="text-gray-700 mb-4">{plan.description}</p>
      <p className="text-2xl font-bold">R${plan.price}/mês</p>
      <Button
        className="mt-4"
        onClick={() =>
          router.push(
            `/subscription/confirmation?value=${plan.value}&price=${plan.price}`
          )
        }>
        Assinar Agora
      </Button>
    </Card>
  );
};
