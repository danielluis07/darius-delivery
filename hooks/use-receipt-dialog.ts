import { Receipt } from "@/app/_features/_user/_components/_receipts/client";
import { create } from "zustand";

interface DialogState {
  isOpen: boolean;
  receipt: Receipt[number] | null;
  openDialog: (receipt: Receipt[number]) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  receipt: null,
  openDialog: (receipt) => set({ isOpen: true, receipt }),
  closeDialog: () => set({ isOpen: false, receipt: null }),
}));
