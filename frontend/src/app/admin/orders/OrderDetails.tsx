import { Order } from './types';

interface OrderDetailsProps {
    order: Order;
    onClose: () => void;
    onUpdateStatus: (orderId: string, status: string) => Promise<void>;
}

export default function OrderDetails({ order, onClose, onUpdateStatus }: OrderDetailsProps) {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Order Details</h2>
                    <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{order.customerName || 'N/A'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{order.customerEmail}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                        <dd className="mt-1">
                            <select
                                value={order.status}
                                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </dd>
                    </div>
                    {order.trackingNumber && (
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Tracking Number</dt>
                            <dd className="mt-1 text-sm text-gray-900">{order.trackingNumber}</dd>
                        </div>
                    )}
                    {order.shippingAddress && (
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                <address className="not-italic">
                                    {order.shippingAddress.line1}<br />
                                    {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}<br />
                                    {order.shippingAddress.country}
                                </address>
                            </dd>
                        </div>
                    )}
                </dl>
            </div>

            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                <div className="mt-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${item.price.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${(item.quantity * item.price).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-gray-50">
                                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                    Total
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${order.amount.toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {order.notes && (
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                    <p className="mt-2 text-sm text-gray-500">{order.notes}</p>
                </div>
            )}
        </div>
    );
} 