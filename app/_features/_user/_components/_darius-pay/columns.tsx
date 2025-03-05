"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

// Mapeamento de status traduzidos
const statusMap: Record<string, string> = {
  PENDING: "Pendente",
  DONE: "Realizada",
  CANCELLED: "Cancelada",
};

export type ResponseType = {
  object: "transfer";
  id: string;
  type: "BANK_ACCOUNT";
  dateCreated: string;
  value: number;
  netValue: number;
  status: "PENDING" | "COMPLETED" | "FAILED"; // Adapte conforme necessário
  transferFee: number;
  effectiveDate: string;
  scheduleDate: string;
  endToEndIdentifier: string | null;
  authorized: boolean;
  failReason: string | null;
  externalReference: string | null;
  transactionReceiptUrl: string | null;
  operationType: "TED" | "DOC" | "PIX"; // Adapte conforme necessário
  description: string | null;
  recurring: boolean | null;
  bankAccount: {
    bank: {
      ispb: string | null;
      code: string;
      name: string;
    };
    accountName: string;
    ownerName: string;
    cpfCnpj: string;
    agency: string;
    agencyDigit: string;
    account: string;
    accountDigit: string;
    pixAddressKey: string | null;
  };
};

export const columns: ColumnDef<ResponseType>[] = [
  {
    accessorKey: "value",
    header: "Valor",
    cell: ({ row }) => {
      const value = row.original.value; // Converter de centavos para reais
      return (
        <span>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(value)}
        </span>
      );
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
    accessorKey: "dateCreated",
    header: "Data",
    cell: ({ row }) => {
      const date = new Date(row.original.dateCreated);
      return <span>{format(date, "dd/MM/yyyy")}</span>;
    },
  },
];
