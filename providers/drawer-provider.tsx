"use client";

import { useEffect, useState } from "react";
import { OrderDetails } from "@/app/_features/_customer/_components/_templates/_template-1/order-details";

export const DrawerProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <OrderDetails />
    </>
  );
};
