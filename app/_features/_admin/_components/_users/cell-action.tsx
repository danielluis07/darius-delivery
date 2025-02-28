"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Ellipsis, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useUpdateUserStatus } from "../../_queries/use-update-user-status";

export const UsersCellAction = ({
  id,
  status,
}: {
  id: string;
  status: boolean | null;
}) => {
  const { mutate, isPending } = useUpdateUserStatus(id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Mudar Status</span>
          <Ellipsis className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => mutate({ isActive: !status })}
          disabled={isPending}>
          {status ? (
            <LockKeyhole className="size-4 mr-2" />
          ) : (
            <LockKeyholeOpen className="size-4 mr-2" />
          )}
          {status ? "Desativar" : "Ativar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
