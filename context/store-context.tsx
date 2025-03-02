"use client";

import { createContext, useContext } from "react";
import { Session } from "next-auth";
import { CustomizationWithTemplate } from "@/types";

type StoreContextType = {
  session: Session | null;
  data: CustomizationWithTemplate | null;
};

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider = ({
  children,
  session,
  data,
}: {
  children: React.ReactNode;
  session: Session | null;
  data: CustomizationWithTemplate | null;
}) => {
  return (
    <StoreContext.Provider value={{ session, data }}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook for easy access
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StorenProvider");
  }
  return context;
};
