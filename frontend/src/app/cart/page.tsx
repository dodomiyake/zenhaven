// app/cart/page.tsx
"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
    const cart = useCartStore((state) => state.cart);

    return (
        <main className="min-h-screen bg-white py-20 px-6 lg:px-20">
            <div className="max-w-screen-xl mx-auto">
                <h1 className="text-3xl font-bold mb-10">Your Cart</h1>

                {cart.length === 0 ? (
                    <p className="text-gray-600">Your cart is empty.</p>
                ) : (
                    <ul className="space-y-6">
                        {cart.map((item) => (
                            <li key={item._id} className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center gap-4">
                                    <Image src={item.image} alt={item.title} width={80} height={80} className="rounded-md" />
                                    <div>
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-gray-500">{item.price}</p>
                                        <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <span className="font-semibold">{item.price}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
