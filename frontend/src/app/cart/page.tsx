"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import { Trash2 } from "lucide-react";


export default function CartPage() {
    const cart = useCartStore((state) => state.cart);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeFromCart = useCartStore((state) => state.removeFromCart);

    // ✅ Calculate total price
    const total = cart.reduce((sum, item) => {
        return sum + parseFloat(item.price.replace("$", "")) * item.quantity;
    }, 0);

    return (
        <main className="min-h-[calc(100vh-80px)] bg-white pt-16 pb-10 px-6 lg:px-20">
            <div className="max-w-screen-xl mx-auto">
                <h1 className="text-3xl font-bold mb-10">Your Cart</h1>

                {cart.length === 0 ? (
                    <p className="text-gray-600">Your cart is empty.</p>
                ) : (
                    <>
                        <ul className="space-y-6">
                            {cart.map((item) => (
                                <li
                                    key={item._id}
                                    className="flex items-center justify-between border-b pb-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            width={80}
                                            height={80}
                                            className="rounded-md"
                                        />
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-gray-500 mt-1">{item.price}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                                                <button
                                                    className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                                                    onClick={() =>
                                                        item.quantity > 1
                                                            ? updateQuantity(item._id, item.quantity - 1)
                                                            : removeFromCart(item._id)
                                                    }
                                                >
                                                    −
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="font-semibold block mb-1">
                                            ${(parseFloat(item.price.replace("$", "")) * item.quantity).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full "
                                            aria-label="Remove item"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                    </div>

                                </li>
                            ))}
                        </ul>

                        <div className="mt-10 max-w-sm ml-auto mb-6">
                            <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                                Have a coupon?
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="coupon"
                                    type="text"
                                    placeholder="Enter code"
                                    className="flex-1 border rounded px-3 py-2 text-sm"
                                />
                                <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
                                    Apply
                                </button>
                            </div>
                        </div>


                        {/* ✅ Total Summary */}
                        <div className="text-right mt-8 border-t pt-6">
                            <p className="text-lg font-semibold">
                                Total:{" "}
                                <span className="text-black">${total.toFixed(2)}</span>
                            </p>
                        </div>

                        <div className="text-right mt-4">
                            <button className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800">
                                Proceed to Checkout
                            </button>
                        </div>

                    </>
                )}
            </div>
        </main>
    );
}
