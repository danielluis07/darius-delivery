import { Product, Combo } from "@/types";
import { create } from "zustand";

type CartItem = (Product | Combo) & { quantity: number };

type CartState = {
  cart: CartItem[];
  addToCart: (product: Product | Combo, userId: string) => boolean;
  removeFromCart: (id: string, userId: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  addToCart: (product, userId) => {
    const { cart } = get();
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      return false;
    }

    // Verifica se o item já foi registrado recentemente
    const cartHistory = JSON.parse(
      localStorage.getItem(`cartHistory-${userId}`) || "[]"
    );

    if (!cartHistory.includes(product.id)) {
      cartHistory.push(product.id);
      localStorage.setItem(
        `cartHistory-${userId}`,
        JSON.stringify(cartHistory)
      );

      // Chamada à API para registrar o evento
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/restaurant-data/cart/user/${userId}`,
        { method: "POST" }
      )
        .then((res) => res.json())
        .then((data) => console.log("Carrinho atualizado:", data))
        .catch((err) => console.error("Erro ao registrar no backend:", err));
    }

    set({ cart: [...cart, { ...product, quantity: 1 }] });
    return true;
  },

  removeFromCart: (id, userId) => {
    set((state) => {
      const updatedCart = state.cart.filter((item) => item.id !== id);

      // Remove o item do histórico do LocalStorage
      const cartHistory = JSON.parse(
        localStorage.getItem(`cartHistory-${userId}`) || "[]"
      );
      const newHistory = cartHistory.filter((itemId: string) => itemId !== id);
      localStorage.setItem(`cartHistory-${userId}`, JSON.stringify(newHistory));

      // Chamada à API para registrar a desistência
      fetch(`/api/restaurant-data/withdrawal/user/${userId}`, {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => console.log("Desistência registrada:", data))
        .catch((err) => console.error("Erro ao registrar a desistência:", err));

      return { cart: updatedCart };
    });
  },

  updateQuantity: (id, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })),

  clearCart: () => set({ cart: [] }),
}));
