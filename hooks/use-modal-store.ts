import { create } from "zustand";

type ModalType =
  | "signUp"
  | "signIn"
  | "categories"
  | "products"
  | "menu"
  | "menuProducts"
  | "productDetails"
  | "cart"
  | "checkout"
  | "combos";

type UseModalStore = {
  modalStack: { type: ModalType; categoryId?: string | null | undefined }[];
  onOpen: (type: ModalType, id?: string) => void;
  onClose: () => void;
};

export const useModalStore = create<UseModalStore>((set) => ({
  modalStack: [],

  onOpen: (type, id) =>
    set((state) => ({
      modalStack: [...state.modalStack, { type, categoryId: id }],
    })),

  onClose: () =>
    set((state) => ({
      modalStack: state.modalStack.slice(0, -1), // Remove only the last opened modal
    })),
}));
