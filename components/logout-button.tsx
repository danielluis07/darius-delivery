"use client";

import { LogOut } from "lucide-react";
import { signout } from "@/app/auth/_actions/sign-out";
import { useExit } from "@/hooks/use-exit";
import { useRouter } from "next/navigation";

export const LogOutButton = ({ open }: { open: boolean }) => {
  const { onOpen, onClose } = useExit();
  const router = useRouter();
  const handleLogout = () => {
    onOpen();
    signout().then(() => {
      onClose();
      router.push("/");
    });
  };
  return (
    <div
      onClick={handleLogout}
      className="flex items-center gap-2 text-error w-full">
      <LogOut className="size-5" />
      {open && <span>Sair</span>}
    </div>
  );
};
