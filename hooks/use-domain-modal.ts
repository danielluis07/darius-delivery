import { create } from "zustand";

interface useDomainModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useDomainModal = create<useDomainModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
