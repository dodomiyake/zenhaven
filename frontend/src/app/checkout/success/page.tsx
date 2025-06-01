"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useCouponStore } from '@/store/couponStore';
import { CheckCircle, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const clearCart = useCartStore(state => state.clearCart);
    const clearCoupon = useCouponStore(state => state.clearCoupon);
    const [isVerifying, setIsVerifying] = useState(true);
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const verifyPayment = async () => {
            const sessionId = searchParams?.get('session_id');
            
            if (!sessionId) {
                setError('No session ID found');
                setIsVerifying(false);
                return;
            }

            try {
                const response = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sessionId }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Payment verification failed');
                }

                if (data.status === 'complete') {
                    setOrderDetails(data.orderDetails);
                    clearCart();
                    clearCoupon();
                } else {
                    throw new Error('Payment not completed');
                }
            } catch (err: any) {
                setError(err.message);
                console.error('Payment verification error:', err);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyPayment();
    }, [searchParams, clearCart, clearCoupon]);

    if (isVerifying) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Payment Verification Failed
                    </h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/cart')}
                        className="bg-black text-white px-6 py-3 rounded w-full hover:bg-gray-800 transition"
                    >
                        Return to Cart
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12">
            <motion.div 
                className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg w-full mx-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        duration: 0.6 
                    }}
                    className="relative w-20 h-20 mx-auto mb-6"
                >
                    <div className="absolute inset-0 bg-green-50 rounded-full" />
                    <CheckCircle className="w-full h-full text-green-500 relative z-10" />
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>

                    {orderDetails && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="text-gray-600" size={20} />
                                <h2 className="font-semibold text-gray-800">Order Details</h2>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600">
                                    Order Number: <span className="font-mono text-gray-800">{orderDetails.orderNumber}</span>
                                </p>
                                <p className="text-gray-600">
                                    Amount: <span className="font-semibold text-gray-800">
                                        ${(orderDetails.amount / 100).toFixed(2)}
                                    </span>
                                </p>
                                {orderDetails.customerEmail && (
                                    <p className="text-gray-600">
                                        Email: <span className="text-gray-800">{orderDetails.customerEmail}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/products')}
                            className="bg-black text-white px-6 py-3 rounded w-full hover:bg-gray-800 transition"
                        >
                            Continue Shopping
                        </motion.button>
                        
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/orders')}
                            className="bg-white text-gray-800 px-6 py-3 rounded w-full border border-gray-300 hover:bg-gray-50 transition"
                        >
                            View Orders
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
} 