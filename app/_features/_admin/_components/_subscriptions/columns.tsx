"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { format } from "date-fns";

export type ResponseType = InferResponseType<
  typeof client.api.admin.subscriptions.$get,
  200
>["data"][0];

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
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "plan",
    header: "Plano",
  },
  {
    accessorKey: "isTrial",
    header: "Perído de Teste",
    cell: ({ row }) => {
      const isTrial = row.original.isTrial;
      return <span>{isTrial === true ? "Sim" : "Não"}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Registrado em",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <span>{format(date, "dd/MM/yyyy")}</span>;
    },
  },
];
