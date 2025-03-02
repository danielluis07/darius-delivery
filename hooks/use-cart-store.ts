import { Product } from "@/types";
import { create } from "zustand";

type CartItem = Product & { quantity: number };

type CartState = {
  cart: CartItem[];
  addToCart: (product: Product) => boolean;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  addToCart: (product) => {
    const { cart } = get();
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      return false;
    }

    set({ cart: [...cart, { ...product, quantity: 1 }] });
    return true;
  },

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })),

  clearCart: () => set({ cart: [] }),
}));
