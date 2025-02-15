"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Ellipsis, Pencil } from "lucide-react";

export const CustomersCellAction = ({ id }: { id: string }) => {
  console.log(id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <Ellipsis className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={false}
          className="cursor-pointer"
          onClick={() => {}}>
          <Pencil className="mr-2 size-5" />
          Editar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
