import { create } from "zustand";

type CheckDeliveryAreaStore = {
  isOpen: boolean;
  onOpenDelivery: () => void;
  onClose: () => void;
};

export const useCheckDeliveryAreaDialog = create<CheckDeliveryAreaStore>(
  (set) => ({
    isOpen: false,
    onOpenDelivery: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  })
);
