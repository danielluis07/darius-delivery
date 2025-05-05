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
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteCombo } from "../../_queries/_combos/use-delete-combo";
import { useConfirmContext } from "@/context/confirm-context";
import { useUpdateComboStatus } from "../../_queries/_combos/use-update-status";

export const CombosCellAction = ({
  id,
  status,
}: {
  id: string;
  status: boolean;
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { storeId } = useParams<{ storeId: string }>();

  const deleteMutation = useDeleteCombo(id, storeId);

  const router = useRouter();

  const { mutate, isPending } = useUpdateComboStatus(id, storeId);

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
          onClick={() => router.push(`/dashboard/${storeId}/combos/${id}`)}>
          <Pencil className="mr-2 size-5" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async () => {
            setOpenDropdownId(null);
            const ok = await confirm({
              title: "Alterar status do combo",
              message: `Você tem certeza que deseja ${
                status ? "desativar" : "ativar"
              } este combo?`,
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
              title: "Deletar o combo",
              message:
                "Você tem certeza que deseja deletar esse combo? Essa ação é irreversível.",
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
