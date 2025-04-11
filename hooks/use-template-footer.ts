import { create } from "zustand";

interface FooterState {
  isOpen: boolean;
  totalPrice: number | null;
  onOpenSheet: () => void;
  onClose: () => void;
}

export const useFooterSheet = create<FooterState>((set) => ({
  isOpen: false,
  totalPrice: null,
  onOpenSheet: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
