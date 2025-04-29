"use client";

import { useEffect, useState } from "react";
import { NonModalSheet } from "@/components/ui/template-footer-sheet";
import { cn, formatCurrency } from "@/lib/utils";
import { useFooterSheet } from "@/hooks/template-1/use-template-footer";
import { useCartStore } from "@/hooks/template-1/use-cart-store";
import { useModalStore } from "@/hooks/template-1/use-modal-store";
import { useStore } from "@/context/store-context";

export const FooterSheet = () => {
  const { isOpen, onClose } = useFooterSheet();
  const { cart } = useCartStore();
  const { onOpen } = useModalStore();
  const { data } = useStore();
  const [sheetState, setSheetState] = useState<"full" | "closed">("closed");

  const totalPrice = cart
    .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
    .toFixed(2);

  useEffect(() => {
    if (isOpen && cart.length > 0) {
      setSheetState("full");
    } else {
      setSheetState("closed");
      onClose();
    }
  }, [isOpen, cart.length, onClose]);

  const handleCloseClick = () => {
    setSheetState("closed");
    onClose();
  };

  const getSheetHeight = () => {
    switch (sheetState) {
      case "full":
        return "h-[50px]";
      case "closed":
      default:
        return "h-0 opacity-0";
    }
  };

  return (
    <NonModalSheet
      isOpen={sheetState === "full"}
      onClose={handleCloseClick}
      side="bottom"
      state={sheetState}
      className={cn(
        getSheetHeight(),
        "z-20 transition-all duration-300 ease-in-out bg-white"
      )}>
      <div
        className={cn(
          "flex justify-between items-center px-4 h-full transition-all duration-300 ease-in-out"
        )}>
        <div>
          Total:{" "}
          <span className="font-semibold">{formatCurrency(totalPrice)}</span>
        </div>
        <button
          style={{
            backgroundColor: data?.colors.button || "white",
            color: data?.colors.font || "black",
          }}
          className="py-1 px-3 rounded-md text-sm font-medium"
          onClick={() => {
            onOpen("cart");
            handleCloseClick();
          }}>
          Fechar Pedido
        </button>
      </div>
    </NonModalSheet>
  );
};
