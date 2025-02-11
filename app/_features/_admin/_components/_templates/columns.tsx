"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { TemplatesCellAction } from "@/app/_features/_admin/_components/_templates/cell-action";
import Image from "next/image";
import placeholder from "@/public/placeholder-image.jpg";

export type ResponseType = InferResponseType<
  typeof client.api.templates.$get,
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
    accessorKey: "preview_image",
    header: "Imagem",
    cell: ({ row }) => (
      <div className="relative w-80 h-44 overflow-hidden rounded-md">
        <Image
          src={row.original.preview_image || placeholder}
          alt={row.original.name}
          fill
          className="object-cover"
        />
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <TemplatesCellAction id={row.original.id} />,
  },
];
