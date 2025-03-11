"use client";

import { useCashReport } from "@/hooks/use-cash-report-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrencyFromCents } from "@/lib/utils";
import { format, parseISO } from "date-fns";

export const ReportDialog = () => {
  const { isOpen, closeModal, data } = useCashReport();
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      {data && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Relatório do Dia{" "}
              {data?.date && format(parseISO(data.date), "dd/MM/yyyy")}
            </DialogTitle>
            <DialogDescription>
              Aqui está o resumo das operações do dia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              <strong>Total de Vendas:</strong>{" "}
              {formatCurrencyFromCents(data.totalRevenue)}
            </p>
            <p>
              <strong>Total de Pedidos:</strong> {data.orderCount}
            </p>
            <p>
              <strong>Pedidos Concluídos:</strong> {data.completedOrders}
            </p>
            <p>
              <strong>Pedidos Pendentes:</strong> {data.pendingOrders}
            </p>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};
