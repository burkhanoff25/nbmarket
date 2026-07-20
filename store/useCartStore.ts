import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem } from '@/types/product';

interface CartState {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPriceUzs: (exchangeRate?: number, markup?: number) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product: Product, quantity = 1) => {
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (item) => item.product.id === product.id
          );
          if (existingIndex > -1) {
            const updated = [...state.cart];
            updated[existingIndex].quantity += quantity;
            return { cart: updated };
          }
          return { cart: [...state.cart, { product, quantity }] };
        });
      },

      removeFromCart: (productId: string) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              cart: state.cart.filter((item) => item.product.id !== productId),
            };
          }
          return {
            cart: state.cart.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          };
        });
      },

      clearCart: () => set({ cart: [] }),

      getTotalCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPriceUzs: (exchangeRate = 1820, markup = 0.25) => {
        return get().cart.reduce((sum, item) => {
          const price =
            item.product.price_uzs ||
            Math.round(
              (item.product.price_cny + 2) * exchangeRate * (1 + markup) / 100
            ) * 100;
          return sum + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'nb_market_cart',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (null as any))),
    }
  )
);
