import { create } from "zustand";

interface useSubdomainModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useSubdomainModal = create<useSubdomainModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
