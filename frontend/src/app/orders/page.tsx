"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, DollarSign, Clock, Mail } from 'lucide-react';

interface Order {
    orderNumber: string;
    amount: number;
    status: string;
    createdAt: string;
    customerEmail: string;
    metadata: Record<string, string>;
}

interface OrdersResponse {
    orders: Order[];
    has_more: boolean;
    next_page: number | null;
    next_cursor: string | null;
    message?: string;
    error?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    const fetchOrders = async (cursor?: string) => {
        try {
            const url = new URL('/api/orders', window.location.origin);
            if (cursor) {
                url.searchParams.set('starting_after', cursor);
            }
            url.searchParams.set('limit', '10');

            const response = await fetch(url.toString());
            const data: OrdersResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch orders');
            }

            if (cursor) {
                setOrders(prev => [...prev, ...data.orders]);
            } else {
                setOrders(data.orders);
            }
            
            setHasMore(data.has_more);
            setNextCursor(data.next_cursor);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching orders:', err);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const loadMore = async () => {
        if (!nextCursor || isLoadingMore) return;
        setIsLoadingMore(true);
        await fetchOrders(nextCursor);
    };

    useEffect(() => {
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
                        onClick={() => {
                            setIsLoading(true);
                            fetchOrders();
                        }}
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
                                        order.status === 'succeeded' 
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
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
                                    {order.customerEmail && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="text-gray-400" size={16} />
                                            <span className="text-sm text-gray-600 truncate">
                                                {order.customerEmail}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {order.metadata && Object.keys(order.metadata).length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                                            Additional Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(order.metadata).map(([key, value]) => (
                                                <div key={key} className="text-sm">
                                                    <span className="text-gray-500">{key}: </span>
                                                    <span className="text-gray-900">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {hasMore && (
                        <div className="text-center mt-8">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={loadMore}
                                disabled={isLoadingMore}
                                className={`bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition ${
                                    isLoadingMore ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoadingMore ? 'Loading...' : 'Load More Orders'}
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 