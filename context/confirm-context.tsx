"use client";

import React, { createContext, useContext } from "react";
import { useConfirm as useConfirmHook } from "@/hooks/use-confirm";

type ConfirmOptions = {
  title?: string;
  message?: string;
};

type ConfirmContextType = {
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const ConfirmProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ConfirmationDialog, confirm] = useConfirmHook();

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationDialog />
    </ConfirmContext.Provider>
  );
};

export const useConfirmContext = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error(
      "useConfirmContext deve ser usado dentro do ConfirmProvider"
    );
  }
  return context;
};
