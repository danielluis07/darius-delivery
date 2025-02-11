"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { OrdersCellAction } from "@/app/_features/_user/_components/_orders/cell-action";
import { format } from "date-fns";
import { formatCurrencyFromCents } from "@/lib/utils";

export type ResponseType = InferResponseType<
  (typeof client.api.orders.user)[":userId"]["$get"],
  200
>["data"][0];

const statusMap = {
  CANCELLED: "Cancelado",
  PREPARING: "Preparando",
  IN_TRANSIT: "Em trânsito",
  DELIVERED: "Entregue",
} as const;

export const columns: ColumnDef<ResponseType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "order.createdAt",
    header: "Data",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <span>{format(date, "dd/MM/yyyy")}</span>;
    },
  },
  {
    id: "status",
    accessorKey: "order.status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return <span>{status ? statusMap[status] : "Desconhecido"}</span>;
    },
  },
  {
    accessorKey: "order.totalPrice",
    header: "Valor Total",
    cell: ({ row }) => {
      const price = row.original.total_price || 0;
      return <span>{formatCurrencyFromCents(price)}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <OrdersCellAction id={row.original.id} />,
  },
];
