"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Ellipsis,
  LockKeyhole,
  LockKeyholeOpen,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDeleteProduct } from "../../_queries/_products/use-delete-product";
import { useConfirmContext } from "@/context/confirm-context";
import { useState } from "react";
import { useUpdateProductStatus } from "../../_queries/_products/use-update-status";

export const ProductsCellAction = ({
  id,
  status,
}: {
  id: string;
  status: boolean;
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const session = useSession();

  const userId =
    session.data?.user.role === "EMPLOYEE"
      ? session.data.user.restaurantOwnerId
      : session?.data?.user.id;

  const deleteMutation = useDeleteProduct(id, userId);
  const { mutate, isPending } = useUpdateProductStatus(id, userId);
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
          className="cursor-pointer"
          onClick={async () => {
            setOpenDropdownId(null);
            const ok = await confirm({
              title: "Alterar status do produto",
              message: `Você tem certeza que deseja ${
                status ? "desativar" : "ativar"
              } este produto?`,
            });

            if (ok) {
              mutate({ isActive: !status });
            }
          }}
          disabled={isPending}>
          {status ? (
            <LockKeyhole className="size-4 mr-2" />
          ) : (
            <LockKeyholeOpen className="size-4 mr-2" />
          )}
          {status ? "Desativar" : "Ativar"}
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
