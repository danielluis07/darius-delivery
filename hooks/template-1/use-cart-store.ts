import { Product, Combo } from "@/types";
import { create } from "zustand";

type Pizza = Product & {
  halfOption?: string;
};

// 1. Modify CartItem Type
type CartItem = (Product | Combo | Pizza) & {
  quantity: number;
  selectedAdditionals?: Record<string, string>;
  effectivePriceInCents?: number;
};

// 2. Update CartState type for the modified addToCart signature
type CartState = {
  cart: CartItem[]; // This now uses the updated CartItem definition
  addToCart: (
    product: Product | Combo | Pizza, // Ensure this product includes priceInCents and additionalGroups
    userId: string,
    selectedAdditionals?: Record<string, string>
  ) => boolean;
  removeFromCart: (id: string, userId: string) => void; // Assuming signature
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  // 3. Modify addToCart implementation
  addToCart: (product, userId, selectedAdditionals) => {
    const { cart } = get();
    const basePrice = product.price || 0;

    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      console.warn(`Product with ID ${product.id} already in cart.`);
      return false;
    }

    // --- Price Calculation Start ---
    let totalAdditionalPrice = 0;

    // Safely check if the product has additionalGroups before accessing it
    if (
      selectedAdditionals && // Check if additionals were selected
      "additionalGroups" in product && // Check if the 'additionalGroups' property exists on the object
      product.additionalGroups && // Check if it's truthy (not null/undefined)
      Array.isArray(product.additionalGroups) && // Check if it's an array
      product.additionalGroups.length > 0 // Check if it's not empty
    ) {
      // Now TypeScript knows product.additionalGroups is safe to access here
      // within this block (it behaves like the type that has additionalGroups)
      for (const groupId in selectedAdditionals) {
        const selectedName = selectedAdditionals[groupId];
        const group = product.additionalGroups.find((g) => g.id === groupId); // Safe access
        if (group && group.additionals) {
          const additional = group.additionals.find(
            (a) => a.name === selectedName
          );
          if (additional && typeof additional.priceAdjustment === "number") {
            totalAdditionalPrice += additional.priceAdjustment;
          }
        }
      }
    }
    // If the product is a Combo or doesn't have valid additionalGroups,
    // the 'if' block is skipped, and totalAdditionalPrice remains 0.

    const effectivePriceInCents = basePrice + totalAdditionalPrice;
    // --- Price Calculation End ---

    // Cart history logic remains the same
    const cartHistory = JSON.parse(
      localStorage.getItem(`cartHistory-${userId}`) || "[]"
    );
    if (!cartHistory.includes(product.id)) {
      cartHistory.push(product.id);
      localStorage.setItem(
        `cartHistory-${userId}`,
        JSON.stringify(cartHistory)
      );
      // NOTE: Ensure fetch URL is correct and handles potential errors
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/restaurant-data/cart/user/${userId}`,
        { method: "POST" }
      )
        .then((res) => {
          if (!res.ok) {
            // Handle HTTP errors (e.g., 4xx, 5xx)
            console.error(`Error response from backend: ${res.status}`);
            // Optionally return or throw error to indicate failure
          }
          return res.json();
        })
        .catch((err) => console.error("Erro ao registrar no backend:", err)); // Handle network errors
    }

    // Add the item with the calculated price
    set({
      cart: [
        ...cart,
        {
          ...product,
          quantity: 1,
          selectedAdditionals,
          effectivePriceInCents, // Store the calculated price
        },
      ],
    });
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

  // updateQuantity implicitly preserves other properties like selectedAdditionals
  // due to the spread operator (...item), so no change needed here.
  updateQuantity: (id, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })),

  clearCart: () => set({ cart: [] }),
}));
