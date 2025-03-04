// src/hooks/useQrCodeModal.ts
import { create } from "zustand";

type PixData = {
  encodedImage: string;
  expirationDate: string | number;
  payload: string;
};

type PixModalState = {
  isOpen: boolean;
  qrCodeData: PixData | null;
  openModal: (data: PixData) => void;
  closeModal: () => void;
};

export const usePixModal = create<PixModalState>((set) => ({
  isOpen: false,
  qrCodeData: null,
  openModal: (qrCodeData: PixData) => set({ isOpen: true, qrCodeData }),
  closeModal: () => set({ isOpen: false, qrCodeData: null }),
}));
