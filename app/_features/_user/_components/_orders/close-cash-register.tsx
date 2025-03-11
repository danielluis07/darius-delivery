"use client";

import { Button } from "@/components/ui/button";
import { ReportDialog } from "@/app/_features/_user/_components/_orders/report-dialog";
import { useCloseCashRegister } from "@/app/_features/_user/_queries/_orders/use-close-cash-register";
import { TbCashRegister } from "react-icons/tb";

export const CloseCashRegister = ({ userId }: { userId: string }) => {
  const { mutate, isPending } = useCloseCashRegister(userId);
  return (
    <>
      <ReportDialog />
      <Button onClick={() => mutate()}>
        {isPending ? "Fechando..." : "Fechar Caixa"} <TbCashRegister />
      </Button>
    </>
  );
};
