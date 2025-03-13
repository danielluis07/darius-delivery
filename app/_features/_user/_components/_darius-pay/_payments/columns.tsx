"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PaymentsCellAction } from "@/app/_features/_user/_components/_darius-pay/_payments/cell-action";

// Mapeamento de status traduzidos
const statusMap: Record<string, string> = {
  OVERDUE: "Atrasado",
  CONFIRMED: "Confirmado",
  CANCELED: "Cancelado",
};

type ResponseType = {
  object: "payment";
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink: string | null;
  value: number;
  netValue: number;
  originalValue: number | null;
  interestValue: number | null;
  description: string | null;
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD" | string;
  pixTransaction: any | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELED" | string;
  dueDate: string;
  originalDueDate: string;
  paymentDate: string | null;
  clientPaymentDate: string | null;
  installmentNumber: number | null;
  invoiceUrl: string;
  invoiceNumber: string;
  externalReference: string;
  deleted: boolean;
  anticipated: boolean;
  anticipable: boolean;
  creditDate: string | null;
  estimatedCreditDate: string | null;
  transactionReceiptUrl: string | null;
  nossoNumero: string | null;
  bankSlipUrl: string | null;
  lastInvoiceViewedDate: string | null;
  lastBankSlipViewedDate: string | null;
  discount: Record<string, any> | null;
  fine: Record<string, any> | null;
  interest: Record<string, any> | null;
  postalService: boolean;
  custody: any | null;
  escrow: any | null;
  refunds: any | null;
};

export const paymentsColumns: ColumnDef<ResponseType>[] = [
  {
    accessorKey: "value",
    header: "Valor",
    cell: ({ row }) => {
      const value = row.original.value;
      return <span>R$ {value.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <span>{statusMap[status] || "Desconhecido"}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <PaymentsCellAction paymentId={row.original.id} />,
  },
];
