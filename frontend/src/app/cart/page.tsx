"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
    const { cart, addToCart, removeFromCart, clearCart } = useCartStore();

    const getTotal = () =>
        cart.reduce((total, item) => total + parseFloat(item.price.replace("$", "")) * item.quantity, 0).toFixed(2);

    return (
        <main className="max-w-screen-xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

            {cart.length === 0 ? (
                <p className="text-gray-600">Your cart is empty.</p>
            ) : (
                <div className="space-y-6">
                    {cart.map((item) => (
                        <div key={item._id} className="flex items-center gap-6 border p-4 rounded-md shadow-sm">
                            <Image src={item.image} alt={item.title} width={100} height={100} className="rounded object-cover" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">{item.title}</h3>
                                <p className="text-gray-700">{item.price}</p>
                                <div className="flex gap-4 items-center mt-2">
                                    <span>Qty: {item.quantity}</span>
                                    <button
                                        onClick={() => addToCart(item)}
                                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="px-3 py-1 bg-red-200 rounded hover:bg-red-300"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="text-right mt-6">
                        <h2 className="text-xl font-bold">Total: ${getTotal()}</h2>
                        <div className="mt-4 flex gap-4 justify-end">
                            <button
                                onClick={clearCart}
                                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Clear Cart
                            </button>
                            <Link
                                href="/checkout"
                                className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
                            >
                                Checkout
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
