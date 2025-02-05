"use client";

import { useEffect, useState } from "react";
import { ExitModal } from "@/components/exit-modal";
import { useExit } from "@/hooks/use-exit";

export const ExitProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isExiting } = useExit();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <ExitModal isExiting={isExiting} />
    </>
  );
};
