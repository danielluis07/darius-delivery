"use client";

import { NewStoreModal } from "@/components/new-store-modal";
import { useEffect, useState } from "react";

export const NewStoreProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <NewStoreModal />
    </>
  );
};
