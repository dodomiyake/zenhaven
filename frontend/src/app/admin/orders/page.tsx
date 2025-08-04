'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Order } from './types';
import OrderDetails from './OrderDetails';
import { apiCall } from '@/utils/api';

type SortField = 'orderNumber' | 'customerEmail' | 'amount' | 'createdAt' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showOrderDetails, setShowOrderDetails] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const ordersPerPage = 10;

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
            const response = await apiCall('/api/admin/orders', {
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

    const sortOrders = (ordersToSort: Order[]): Order[] => {
        return [...ordersToSort].sort((a, b) => {
            const direction = sortConfig.direction === 'asc' ? 1 : -1;
            
            switch (sortConfig.field) {
                case 'amount':
                    return (a.amount - b.amount) * direction;
                case 'createdAt':
                    return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
                default:
                    return (a[sortConfig.field] > b[sortConfig.field] ? 1 : -1) * direction;
            }
        });
    };

    const handleSort = (field: SortField) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const refreshOrders = async () => {
        setIsRefreshing(true);
        await fetchOrders();
        setIsRefreshing(false);
    };

    const handleSelectAll = () => {
        if (selectedOrders.size === filteredOrders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
        }
    };

    const handleSelectOrder = (orderId: string) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
        } else {
            newSelected.add(orderId);
        }
        setSelectedOrders(newSelected);
    };

    const updateBulkOrderStatus = async (newStatus: Order['status']) => {
        const promises = Array.from(selectedOrders).map(orderId => 
            updateOrderStatus(orderId, newStatus)
        );

        try {
            await Promise.all(promises);
            toast.success(`Updated ${selectedOrders.size} orders to ${newStatus}`);
            setSelectedOrders(new Set());
        } catch (error) {
            toast.error('Failed to update some orders');
        }
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginatedOrders = sortOrders(filteredOrders).slice(
        (page - 1) * ordersPerPage,
        page * ordersPerPage
    );

    const renderSortIcon = (field: SortField) => {
        if (sortConfig.field !== field) {
            return <ChevronUp className="w-4 h-4 text-gray-400" />;
        }
        return sortConfig.direction === 'asc' 
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />;
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const adminToken = localStorage.getItem('adminToken');
            const response = await apiCall(`/api/admin/orders?id=${orderId}`, {
                method: 'PATCH',
                headers: {
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Orders</h1>
                <button
                    onClick={refreshOrders}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters and Actions */}
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
                <div className="flex gap-2">
                    {selectedOrders.size > 0 && (
                        <select
                            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                            onChange={(e) => updateBulkOrderStatus(e.target.value as Order['status'])}
                            value=""
                        >
                            <option value="" disabled>Bulk Update Status</option>
                            <option value="pending">Mark as Pending</option>
                            <option value="processing">Mark as Processing</option>
                            <option value="shipped">Mark as Shipped</option>
                            <option value="delivered">Mark as Delivered</option>
                            <option value="cancelled">Mark as Cancelled</option>
                        </select>
                    )}
                    <button
                        onClick={exportOrders}
                        disabled={!filteredOrders.length}
                        className={`flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors ${
                            !filteredOrders.length ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <Download size={20} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {paginatedOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.size === filteredOrders.length}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-black focus:ring-black"
                                        />
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('orderNumber')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Order Number
                                            {renderSortIcon('orderNumber')}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('customerEmail')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Customer
                                            {renderSortIcon('customerEmail')}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('amount')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Amount
                                            {renderSortIcon('amount')}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Status
                                            {renderSortIcon('status')}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Date
                                            {renderSortIcon('createdAt')}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedOrders.map((order) => (
                                    <motion.tr
                                        key={order.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => setShowOrderDetails(order.id)}
                                    >
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.has(order.id)}
                                                onChange={() => handleSelectOrder(order.id)}
                                                className="rounded border-gray-300 text-black focus:ring-black"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.orderNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>
                                                {order.customerEmail || 'N/A'}
                                                {order.customerName && (
                                                    <div className="text-xs text-gray-400">{order.customerName}</div>
                                                )}
                                            </div>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                                value={order.status}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateOrderStatus(order.id, e.target.value);
                                                }}
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                    page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                    page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{((page - 1) * ordersPerPage) + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(page * ordersPerPage, filteredOrders.length)}</span> of{' '}
                                    <span className="font-medium">{filteredOrders.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setPage(1)}
                                        disabled={page === 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                                            page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        First
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                                            page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    page === pageNum
                                                        ? 'z-10 bg-black text-white border-black'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                                            page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={() => setPage(totalPages)}
                                        disabled={page === totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                                            page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        Last
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {showOrderDetails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowOrderDetails(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {orders.find(o => o.id === showOrderDetails) && (
                                <OrderDetails
                                    order={orders.find(o => o.id === showOrderDetails)!}
                                    onClose={() => setShowOrderDetails(null)}
                                    onUpdateStatus={updateOrderStatus}
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 