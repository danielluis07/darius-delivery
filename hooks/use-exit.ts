import { create } from "zustand";

type useExitStore = {
  id?: string;
  isExiting: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useExit = create<useExitStore>((set) => ({
  id: undefined,
  isExiting: false,
  onOpen: () => set({ isExiting: true }),
  onClose: () => set({ isExiting: false }),
}));
