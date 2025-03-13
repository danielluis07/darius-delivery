import { OrderData } from "@/app/_features/_customer/_components/_templates/_template-1/modals/cart";
import { create } from "zustand";

type DeliveryFeeAlertStore = {
  isOpen: boolean;
  message: string | undefined;
  orderData: OrderData | null;
  params: string;
  onOpenAlert: (
    OrderData: OrderData,
    message: string | undefined,
    params: string
  ) => void;
  onClose: () => void;
};

export const useDeliveryFeeAlert = create<DeliveryFeeAlertStore>((set) => ({
  isOpen: false,
  message: undefined,
  orderData: null,
  params: "",
  onOpenAlert: (
    orderData: OrderData,
    message: string | undefined,
    params: string
  ) => set({ isOpen: true, orderData, message, params }),
  onClose: () => set({ isOpen: false }),
}));
