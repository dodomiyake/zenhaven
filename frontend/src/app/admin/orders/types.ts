export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerEmail: string;
    customerName?: string;
    amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    items: OrderItem[];
    shippingAddress?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };
    notes?: string;
    trackingNumber?: string;
} 