// src/hooks/useQrCodeModal.ts
import { create } from "zustand";

type Data = {
  date: string;
  totalRevenue: number;
  orderCount: number;
  completedOrders: number;
  pendingOrders: number;
};

type ModalState = {
  isOpen: boolean;
  data: Data | null;
  openModal: (data: Data) => void;
  closeModal: () => void;
};

export const useCashReport = create<ModalState>((set) => ({
  isOpen: false,
  data: null,
  openModal: (data: Data) => set({ isOpen: true, data }),
  closeModal: () => set({ isOpen: false, data: null }),
}));
