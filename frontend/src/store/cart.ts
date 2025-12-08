import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  productNameAr?: string;
  farmId: string;
  farmName: string;
  farmSlug: string;
  price: number;
  unit: string;
  quantity: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  clearFarmItems: (farmId: string) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  getFarmIds: () => string[];
  getItemsByFarm: (farmId: string) => CartItem[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += quantity;
            return { items: newItems };
          }

          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      clearFarmItems: (farmId) => {
        set((state) => ({
          items: state.items.filter((i) => i.farmId !== farmId),
        }));
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getFarmIds: () => {
        return [...new Set(get().items.map((i) => i.farmId))];
      },

      getItemsByFarm: (farmId) => {
        return get().items.filter((i) => i.farmId === farmId);
      },
    }),
    {
      name: 'farmbox-cart',
    }
  )
);
