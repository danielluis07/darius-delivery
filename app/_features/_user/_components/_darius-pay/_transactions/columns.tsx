"use client";

import { client } from "@/lib/hono";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { InferResponseType } from "hono";

// Mapeamento de status traduzidos
const statusMap: Record<string, string> = {
  PENDING: "Pendente",
  COMPLETED: "Realizada",
  FAILED: "Cancelada",
};

export type ResponseType = InferResponseType<
  (typeof client.api.transactions.store)[":storeId"]["$get"],
  200
>["data"][0];

export const transactionsColumns: ColumnDef<ResponseType>[] = [
  {
    accessorKey: "buyerName",
    header: "Valor",
  },
  {
    accessorKey: "productName",
    header: "Produto",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.transactionStatus;
      return <span>{statusMap[status] || "Desconhecido"}</span>;
    },
  },
  {
    accessorKey: "totalPrice",
    header: "Valor",
  },
  {
    accessorKey: "transactionCreatedAt",
    header: "Data",
    cell: ({ row }) => {
      const date = new Date(row.original.transactionCreatedAt);
      return <span>{format(date, "dd/MM/yyyy")}</span>;
    },
  },
];
