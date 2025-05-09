// src/store/storeSelectionStore.ts (or any other path)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface StoreSelectionState {
  selectedStoreId: string | null;
  setSelectedStore: (storeId: string | null) => void;
  clearSelection: () => void;
}

export const useStoreSelectionStore = create<StoreSelectionState>()(
  persist(
    (set) => ({
      selectedStoreId: null,
      setSelectedStore: (storeId) =>
        set({
          selectedStoreId: storeId,
        }),
      clearSelection: () =>
        set({
          selectedStoreId: null,
        }),
    }),
    {
      name: "store-selection-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
