'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Order {
    id: string;
    orderNumber: string;
    customerEmail: string;
    amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch orders when component mounts
    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders when search term, status filter, or orders change
    useEffect(() => {
        if (orders.length > 0) {
            filterOrders();
        } else {
            setFilteredOrders([]);
        }
    }, [searchTerm, statusFilter, orders]);

    const fetchOrders = async () => {
        try {
            const adminToken = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/orders', {
                headers: {
                    'x-admin-token': adminToken || ''
                }
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setOrders([]);
            toast.error(error instanceof Error ? error.message : 'Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(order => 
                order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const adminToken = localStorage.getItem('adminToken');
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-token': adminToken || ''
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update order status');
            }

            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
            ));
            toast.success('Order status updated successfully');
        } catch (error) {
            console.error('Failed to update order status:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update order status');
        }
    };

    const exportOrders = () => {
        if (!filteredOrders.length) return;

        const csv = [
            ['Order Number', 'Customer Email', 'Amount', 'Status', 'Created At'],
            ...filteredOrders.map(order => [
                order.orderNumber,
                order.customerEmail || 'N/A',
                order.amount.toFixed(2),
                order.status,
                new Date(order.createdAt).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-10 pr-4 py-2 w-full sm:w-64 border rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-gray-400" />
                        <select
                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={exportOrders}
                    disabled={!filteredOrders.length}
                    className={`flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center ${
                        !filteredOrders.length ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    <Download size={20} />
                    Export CSV
                </button>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.orderNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.customerEmail || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${order.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                                                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                                                ${order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : ''}
                                                ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                                            `}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <select
                                                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No orders found
                    </div>
                )}
            </div>
        </div>
    );
} 