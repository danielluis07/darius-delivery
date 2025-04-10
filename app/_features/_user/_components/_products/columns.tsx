"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { ProductsCellAction } from "@/app/_features/_user/_components/_products/cell-action";
import Image from "next/image";
import placeholder from "@/public/placeholder-image.jpg";
import { formatCurrencyFromCents } from "@/lib/utils";

export type ResponseType = InferResponseType<
  (typeof client.api.products.user)[":userId"]["$get"],
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
    accessorKey: "price",
    header: "Preço",
    cell: ({ row }) => formatCurrencyFromCents(row.original.price),
  },
  {
    accessorKey: "image",
    header: "Imagem",
    cell: ({ row }) => (
      <div className="relative size-20 overflow-hidden rounded-md">
        <Image
          src={row.original.image || placeholder}
          alt={row.original.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductsCellAction id={row.original.id} />,
  },
];
