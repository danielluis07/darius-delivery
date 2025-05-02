import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import { create } from "zustand";

type Receipt = InferResponseType<
  (typeof client.api.receipts.user)[":userId"]["$get"],
  200
>["data"];
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
