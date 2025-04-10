"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDeleteProduct } from "../../_queries/_products/use-delete-product";
import { useConfirmContext } from "@/context/confirm-context";
import { useState } from "react";

export const ProductsCellAction = ({ id }: { id: string }) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const session = useSession();

  const userId =
    session.data?.user.role === "EMPLOYEE"
      ? session.data.user.restaurantOwnerId
      : session?.data?.user.id;

  const deleteMutation = useDeleteProduct(id, userId);

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
          onClick={() => router.push(`/dashboard/products/${id}`)}>
          <Pencil className="mr-2 size-5" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={deleteMutation.isPending}
          className="cursor-pointer"
          onClick={async () => {
            setOpenDropdownId(null);
            const ok = await confirm({
              title: "Deletar o produto",
              message:
                "Você tem certeza que deseja deletar este produto? Essa ação é irreversível.",
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
