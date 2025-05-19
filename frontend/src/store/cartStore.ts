// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Product = {
    _id: string;
    title: string;
    price: string;
    image: string;
};

type CartItem = Product & { quantity: number };

type CartStore = {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            cart: [],

            addToCart: (product) => {
                const existing = get().cart.find((item) => item._id === product._id);
                if (existing) {
                    set({
                        cart: get().cart.map((item) =>
                            item._id === product._id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    });
                } else {
                    set({
                        cart: [...get().cart, { ...product, quantity: 1 }],
                    });
                }
            },

            removeFromCart: (id) => {
                set({ cart: get().cart.filter((item) => item._id !== id) });
            },

            clearCart: () => set({ cart: [] }),
        }),
        {
            name: "cart-storage", // key in localStorage
        }
    )
);
