"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { UsersCellAction } from "@/app/_features/_admin/_components/_users/cell-action";
import { format } from "date-fns";
import { formatPhoneNumber } from "@/lib/utils";

export type ResponseType = InferResponseType<
  typeof client.api.users.$get,
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
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => {
      return <span>{formatPhoneNumber(row.original.phone || "")}</span>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.isActive;
      return <span>{status === true ? "Ativo" : "Inativo"}</span>;
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
  {
    id: "actions",
    cell: ({ row }) => (
      <UsersCellAction id={row.original.id} status={row.original.isActive} />
    ),
  },
];
