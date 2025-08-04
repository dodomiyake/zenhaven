"use client";

import { useCartStore } from "@/store/cartStore";
import { useCouponStore } from "@/store/couponStore";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";

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
    const clearCart = useCartStore((state) => state.clearCart);
    
    // Replace local state with persistent store
    const { couponCode, discount, setCoupon, clearCoupon } = useCouponStore();
    const [inputCouponCode, setInputCouponCode] = useState(couponCode);
    const [isLoading, setIsLoading] = useState(false);

    // Add email state
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    // Sync input with stored coupon on mount
    useEffect(() => {
        setInputCouponCode(couponCode);
    }, [couponCode]);

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        const upperCoupon = inputCouponCode.toUpperCase();
        if (coupons[upperCoupon]) {
            setCoupon(upperCoupon, coupons[upperCoupon]);
            toast.success(`Coupon "${upperCoupon}" applied successfully!`);
        } else {
            clearCoupon();
            setInputCouponCode("");
            toast.error("Invalid coupon code");
        }
    }

    const handleRemoveCoupon = () => {
        clearCoupon();
        setInputCouponCode("");
        toast.success("Coupon removed successfully");
    }

    const handleRemoveItem = (id: string, title: string) => {
        removeFromCart(id);
        toast.success(`${title} removed from cart`);
    };

    const handleUpdateQuantity = (id: string, quantity: number, title: string) => {
        if (quantity === 0) {
            handleRemoveItem(id, title);
            return;
        }
        updateQuantity(id, quantity);
        toast.success(`${title} quantity updated`);
    };

    // Email validation function
    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('Email is required');
            return false;
        }
        if (!re.test(email)) {
            setEmailError('Please enter a valid email address');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleCheckout = async () => {
        // Validate email before proceeding
        if (!validateEmail(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setIsLoading(true);

            // Helper function to ensure absolute URLs
            const getAbsoluteImageUrl = (imageUrl: string) => {
                if (imageUrl.startsWith('http')) return imageUrl;
                // If it's a relative URL, convert to absolute
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
                return new URL(imageUrl, baseUrl).toString();
            };

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cartItems: cart.map(item => ({
                        id: item._id,
                        name: item.title,
                        description: item.title,
                        price: parseFloat(item.price.replace(/[^0-9.]/g, "")),
                        quantity: item.quantity,
                        images: item.image ? [getAbsoluteImageUrl(item.image)] : []
                    })),
                    customerEmail: email.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            // Redirect to stripe payment page using the session ID
            const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
            if (!stripe) throw new Error('Failed to load Stripe');

            const { error } = await stripe.redirectToCheckout({
                sessionId: data.sessionId
            });

            if (error) throw error;

        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to initiate checkout. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed top-4 right-4 z-50" />
            <main className="min-h-[calc(100vh-80px)] bg-white pt-16 pb-10 px-6 lg:px-20">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex justify-between items-center mb-10">
                        <h1 className="text-3xl font-bold">Your Cart</h1>
                        <motion.div 
                            className="text-sm text-gray-500"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            key={itemCount}
                        >
                            {itemCount} item{itemCount !== 1 && "s"} in cart
                        </motion.div>
                    </div>

                    {cart.length === 0 ? (
                        <motion.div 
                            className="text-center py-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <p className="text-gray-600 mb-4">Your cart is empty.</p>
                            <a 
                                href="/products" 
                                className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
                            >
                                Continue Shopping
                            </a>
                        </motion.div>
                    ) : (
                        <>
                            <AnimatePresence mode="popLayout">
                                <ul className="space-y-6">
                                    {cart.map((item) => (
                                        <motion.li
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex items-center justify-between border-b pb-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <motion.div 
                                                    className="relative w-20 h-20"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <Image
                                                        src={item.image}
                                                        alt={item.title}
                                                        fill
                                                        className="rounded-md object-cover"
                                                    />
                                                </motion.div>
                                                <div>
                                                    <p className="font-medium">{item.title}</p>
                                                    <p className="text-gray-500 mt-1">{item.price}</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
                                                        <motion.button
                                                            whileTap={{ scale: 0.95 }}
                                                            className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                                                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1, item.title)}
                                                        >
                                                            −
                                                        </motion.button>
                                                        <motion.span
                                                            key={item.quantity}
                                                            initial={{ scale: 1.2 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            {item.quantity}
                                                        </motion.span>
                                                        <motion.button
                                                            whileTap={{ scale: 0.95 }}
                                                            className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                                                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1, item.title)}
                                                        >
                                                            +
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <motion.span 
                                                    className="font-semibold block mb-1"
                                                    key={item.quantity}
                                                    initial={{ scale: 1.1 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    ${(parseFloat(item.price.replace(/[^0-9.]/g, "")) * item.quantity).toFixed(2)}
                                                </motion.span>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleRemoveItem(item._id, item.title)}
                                                    className="text-red-500 hover:text-red-700 p-1 rounded-full"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 size={16} />
                                                </motion.button>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            </AnimatePresence>

                            {/* Add test card notice */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <h3 className="font-medium text-blue-800 mb-2">🛠️ Test Card Details</h3>
                                    <div className="text-sm text-blue-700 space-y-1">
                                        <p>Use these details for testing:</p>
                                        <ul className="list-disc list-inside">
                                            <li>Card: 4242 4242 4242 4242</li>
                                            <li>Expiry: Any future date</li>
                                            <li>CVC: Any 3 digits</li>
                                            <li>ZIP: Any 5 digits</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <motion.div 
                                className="mt-10 max-w-sm ml-auto mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                                    Have a coupon?
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        id="coupon"
                                        type="text"
                                        value={inputCouponCode}
                                        onChange={(e) => setInputCouponCode(e.target.value)}
                                        placeholder="Enter code"
                                        className="flex-1 border rounded px-3 py-2 text-sm"
                                    />
                                    {discount > 0 && (
                                        <motion.button
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={handleRemoveCoupon}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                                            aria-label="Remove coupon"
                                        >
                                            <Trash2 size={16} />
                                        </motion.button>
                                    )}
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleApplyCoupon}
                                        disabled={!inputCouponCode}
                                        className={`px-4 py-2 rounded text-white ${
                                            inputCouponCode ? "bg-gray-700 hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        Apply
                                    </motion.button>
                                </div>
                            </motion.div>

                            <motion.div 
                                className="text-right mt-8 border-t pt-6 space-y-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.p 
                                    className="text-base text-gray-600"
                                    layout
                                >
                                    Subtotal: ${total.toFixed(2)}
                                </motion.p>

                                <AnimatePresence>
                                    {discount > 0 && (
                                        <motion.p 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-base text-green-600"
                                        >
                                            Discount: -${(total * discount).toFixed(2)} ({(discount * 100).toFixed(0)}% off)
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <motion.p 
                                    className="text-lg font-semibold"
                                    layout
                                >
                                    Total:{" "}
                                    <motion.span 
                                        className="text-black"
                                        key={total - (total * discount)}
                                        initial={{ scale: 1.1 }}
                                        animate={{ scale: 1 }}
                                    >
                                        ${(total - total * discount).toFixed(2)}
                                    </motion.span>
                                </motion.p>
                            </motion.div>

                            <div className="mt-6 max-w-sm ml-auto">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) validateEmail(e.target.value);
                                    }}
                                    placeholder="Enter your email"
                                    className={`w-full border rounded px-3 py-2 text-sm ${
                                        emailError ? 'border-red-500' : 'border-gray-300'
                                    } focus:outline-none focus:ring-1 focus:ring-black`}
                                />
                                {emailError && (
                                    <p className="mt-1 text-sm text-red-500">{emailError}</p>
                                )}
                            </div>

                            <div className="text-right mt-4">
                                <div className="flex justify-end gap-4">
                                    <motion.a
                                        href="/products"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-white text-gray-800 border border-gray-300 px-6 py-3 rounded hover:bg-gray-50"
                                    >
                                        Continue Shopping
                                    </motion.a>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCheckout}
                                        disabled={isLoading || cart.length === 0}
                                        className={`relative px-6 py-3 rounded text-white ${
                                            isLoading || cart.length === 0 
                                                ? "bg-gray-400 cursor-not-allowed" 
                                                : "bg-black hover:bg-gray-800"
                                        }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="opacity-0">Proceed to Checkout</span>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            </>
                                        ) : (
                                            "Proceed to Checkout"
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
