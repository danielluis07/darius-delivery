"use client";

import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Ellipsis, HandCoins } from "lucide-react";
import { requestAnticipation } from "@/app/_features/_user/_actions/request-anticipation";
import { toast } from "sonner";

export const PaymentsCellAction = ({ paymentId }: { paymentId: string }) => {
  const [isPending, startTransition] = useTransition();

  const handleRequestAnticipation = () => {
    startTransition(() => {
      requestAnticipation(paymentId).then((res) => {
        if (!res.success) {
          toast.error(res.message);
        }

        if (res.success) {
          toast.success(res.message);
        }
      });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <Ellipsis className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleRequestAnticipation}>
          <HandCoins className="mr-2 size-5" />
          {isPending ? "Solicitando..." : "Solicitar antecipação"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
