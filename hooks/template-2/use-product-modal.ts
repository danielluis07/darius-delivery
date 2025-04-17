// src/hooks/useQrCodeModal.ts
import { create } from "zustand";

type ProductData = {
  id: string;
  userId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};

type ProductDataState = {
  isOpen: boolean;
  productData: ProductData | null;
  openModal: (data: ProductData) => void;
  closeModal: () => void;
};

export const useProductModal = create<ProductDataState>((set) => ({
  isOpen: false,
  productData: null,
  openModal: (productData: ProductData) => set({ isOpen: true, productData }),
  closeModal: () => set({ isOpen: false, productData: null }),
}));
