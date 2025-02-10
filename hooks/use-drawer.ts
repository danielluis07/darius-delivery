import { create } from "zustand";

type useOpenDrawerStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useOpenDrawer = create<useOpenDrawerStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
