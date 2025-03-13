import { create } from "zustand";

type CheckDeliveryAreaStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useCheckDeliveryAreaDialog = create<CheckDeliveryAreaStore>(
  (set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  })
);
