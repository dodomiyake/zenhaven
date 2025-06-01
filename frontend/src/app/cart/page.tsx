"use client";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState } from "react";

// Define proper types
interface CartItem {
    _id: string;
    title: string;
    price: string;
    image: string;
    quantity: number;
}

export default function CartPage() {
    const cart = useCartStore((state) => state.cart) as CartItem[];
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [message, setMessage] = useState("");

    // Calculate total price with safe parsing
    const total = cart.reduce((sum, item) => {
        try {
            const price = parseFloat(item.price.replace(/[^0-9.]/g, ""));
            return sum + (isNaN(price) ? 0 : price * item.quantity);
        } catch (error) {
            console.error(`Error calculating price for item ${item._id}:`, error);
            return sum;
        }
    }, 0);

    const coupons: Record<string, number> = {
        ZEN10: 0.10,
        ZEN20: 0.20,
        FREESHIP: 0.05, // example flat 5% discount 
    }

    const handleApplyCoupon = () => {
        const upperCoupon = couponCode.toUpperCase();
        if (coupons[upperCoupon]) {
            setDiscount(coupons[upperCoupon]);
            setMessage(`Coupon  "${upperCoupon}" applied`);
        } else {
            setDiscount(0);
            setMessage(`Invalid coupon code`);
        }
    }


    const handleCheckout = () => {
        // TODO: Implement checkout logic
        console.log("Proceeding to checkout with total:", total);
    };

    return (
        <main className="min-h-[calc(100vh-80px)] bg-white pt-16 pb-10 px-6 lg:px-20">
            <div className="max-w-screen-xl mx-auto">
                <h1 className="text-3xl font-bold mb-10">Your Cart</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-600 mb-4">Your cart is empty.</p>
                        <a
                            href="/products"
                            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
                        >
                            Continue Shopping
                        </a>
                    </div>
                ) : (
                    <>
                        <ul className="space-y-6">
                            {cart.map((item) => (
                                <li
                                    key={item._id}
                                    className="flex items-center justify-between border-b pb-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-20">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="rounded-md object-cover"
                                            />
                                        </div>
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
                                            ${(parseFloat(item.price.replace(/[^0-9.]/g, "")) * item.quantity).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full"
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
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter code"
                                    className="flex-1 border rounded px-3 py-2 text-sm"
                                />
                                {message && (
                                    <p
                                        className={`mt-2 text-sm ${discount > 0 ? "text-green-600" : "text-red-500"
                                            }`}
                                    >
                                        {message}
                                    </p>
                                )}

                                <button
                                    onClick={handleApplyCoupon}
                                    className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        <div className="text-right mt-8 border-t pt-6 space-y-2">
                            <p className="text-base text-gray-600">Subtotal: ${total.toFixed(2)}</p>

                            {discount > 0 && (
                                <p className="text-base text-green-600">
                                    Discount: -${(total * discount).toFixed(2)} ({(discount * 100).toFixed(0)}% off)
                                </p>
                            )}

                            <p className="text-lg font-semibold">
                                Total:{" "}
                                <span className="text-black">
                                    ${(total - total * discount).toFixed(2)}
                                </span>
                            </p>
                        </div>


                        <div className="text-right mt-4">
                            <button
                                onClick={handleCheckout}
                                className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
