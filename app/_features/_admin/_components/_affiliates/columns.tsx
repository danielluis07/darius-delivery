"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { format } from "date-fns";
import { formatPhoneNumber } from "@/lib/utils";
import { AffiliatesCellAction } from "@/app/_features/_admin/_components/_affiliates/cell-action";

export type ResponseType = InferResponseType<
  typeof client.api.admin.affiliates.$get,
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
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => {
      return <span>{formatPhoneNumber(row.original.phone || "")}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Data de cadastro",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <span>{format(date, "dd/MM/yyyy")}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <AffiliatesCellAction userId={row.original.id} />,
  },
];
