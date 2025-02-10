import { create } from "zustand";

type ModalType =
  | "signUp"
  | "signIn"
  | "products"
  | "settings"
  | "productDetails"
  | null;

type UseModalStore = {
  modalType: ModalType;
  categoryId: string | null;
  onOpen: (type: ModalType, id?: string) => void;
  onClose: () => void;
};

export const useModalStore = create<UseModalStore>((set) => ({
  modalType: null,
  categoryId: null,
  onOpen: (type, id) => set({ modalType: type, categoryId: id }),
  onClose: () => set({ modalType: null }),
}));
