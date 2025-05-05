import { create } from "zustand";

interface useNewStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useNewStoreModal = create<useNewStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
