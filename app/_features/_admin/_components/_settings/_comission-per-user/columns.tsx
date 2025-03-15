"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { ComissionInput } from "./comission-input";

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
    accessorKey: "comissionPercentage",
    header: "Comissão",
    cell: ({ row }) => (
      <span className="text-center">
        {row.original.comissionPercentage || "---"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ComissionInput
        id={row.original.id}
        comission={row.original.comissionPercentage}
      />
    ),
  },
];
