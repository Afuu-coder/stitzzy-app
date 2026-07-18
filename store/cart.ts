"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartState {
  items:        CartItem[];
  // Actions
  addItem:      (item: CartItem) => void;
  removeItem:   (productId: string, size: string) => void;
  updateQty:    (productId: string, size: string, qty: number) => void;
  clearCart:    () => void;
  // Derived
  totalItems:   () => number;
  subTotal:     () => number;
  discountAmount: () => number;
  totalAmount:  () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.findIndex(
            (i) => i.productId === newItem.productId && i.size === newItem.size
          );
          if (existing >= 0) {
            const updated = [...state.items];
            updated[existing] = {
              ...updated[existing],
              qty: updated[existing].qty + newItem.qty,
            };
            return { items: updated };
          }
          return { items: [...state.items, newItem] };
        }),

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        })),

      updateQty: (productId, size, qty) =>
        set((state) => {
          if (qty <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.productId === productId && i.size === size)
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId && i.size === size ? { ...i, qty } : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      subTotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0),

      discountAmount: () => {
        // Disabled per user request (no discounts)
        return 0;
      },

      totalAmount: () => {
        const state = get();
        return Math.max(0, state.subTotal() - state.discountAmount());
      },
    }),
    {
      name:    "stitzzy-cart",      // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);
