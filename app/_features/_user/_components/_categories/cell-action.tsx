"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDeleteCategory } from "@/app/_features/_user/_queries/_categories/use-delete-category";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useConfirmContext } from "@/context/confirm-context";

export const CategoriesCellAction = ({ id }: { id: string }) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { storeId } = useParams<{ storeId: string }>();

  const deleteMutation = useDeleteCategory(id, storeId);

  const router = useRouter();

  const { confirm } = useConfirmContext();

  return (
    <DropdownMenu
      open={openDropdownId === id}
      onOpenChange={(isOpen) => {
        setOpenDropdownId(isOpen ? id : null);
      }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <Ellipsis className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={deleteMutation.isPending}
          className="cursor-pointer"
          onClick={() => router.push(`/dashboard/${storeId}/categories/${id}`)}>
          <Pencil className="mr-2 size-5" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={deleteMutation.isPending}
          className="cursor-pointer"
          onClick={async () => {
            setOpenDropdownId(null);
            const ok = await confirm({
              title: "Deletar a categoria",
              message:
                "Você tem certeza que deseja deletar essa categoria? Essa ação é irreversível.",
            });

            if (ok) {
              deleteMutation.mutate();
            }
          }}>
          <Trash2 className="mr-2 size-5 text-error" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
