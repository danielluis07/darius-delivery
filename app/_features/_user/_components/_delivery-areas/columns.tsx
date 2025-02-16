"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { DeliveryAreasCellAction } from "@/app/_features/_user/_components/_delivery-areas/cell-action";
import { formatCurrencyFromCents } from "@/lib/utils";

export type ResponseType = InferResponseType<
  (typeof client.api.deliveryareas.user)[":userId"]["$get"],
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
    accessorKey: "city",
    header: "Cidade",
  },
  {
    accessorKey: "neighborhood",
    header: "Bairro",
  },
  {
    accessorKey: "state",
    header: "Estado",
    cell: ({ row }) => row.original.state,
  },
  {
    accessorKey: "delivery_fee",
    header: "Taxa",
    cell: ({ row }) => formatCurrencyFromCents(row.original.delivery_fee),
  },
  {
    id: "actions",
    cell: ({ row }) => <DeliveryAreasCellAction id={row.original.id} />,
  },
];
