"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, DollarSign, Clock } from 'lucide-react';

interface Order {
    orderNumber: string;
    amount: number;
    status: string;
    createdAt: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch orders');
                }

                setOrders(data.orders);
            } catch (err: any) {
                setError(err.message);
                console.error('Error fetching orders:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Error Loading Orders
                    </h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.reload()}
                        className="bg-black text-white px-6 py-3 rounded w-full hover:bg-gray-800 transition"
                    >
                        Try Again
                    </motion.button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        No Orders Yet
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Looks like you haven't made any purchases yet.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = '/products'}
                        className="bg-black text-white px-6 py-3 rounded w-full hover:bg-gray-800 transition"
                    >
                        Start Shopping
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
                
                <div className="space-y-6">
                    {orders.map((order) => (
                        <motion.div
                            key={order.orderNumber}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Package className="text-gray-500" size={20} />
                                        <h2 className="font-semibold text-gray-900">
                                            Order #{order.orderNumber}
                                        </h2>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        order.status === 'completed' 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-gray-400" size={16} />
                                        <span className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="text-gray-400" size={16} />
                                        <span className="text-sm text-gray-600">
                                            Total: ${(order.amount / 100).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="text-gray-400" size={16} />
                                        <span className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 border-t pt-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                                        Items
                                    </h3>
                                    <div className="space-y-2">
                                        {order.items.map((item, index) => (
                                            <div 
                                                key={index}
                                                className="flex justify-between text-sm"
                                            >
                                                <span className="text-gray-600">
                                                    {item.quantity}x {item.name}
                                                </span>
                                                <span className="text-gray-900 font-medium">
                                                    ${(item.price * item.quantity / 100).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
} 