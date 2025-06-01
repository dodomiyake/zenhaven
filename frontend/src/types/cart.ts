export interface CartItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    images?: string[];
}

export interface Cart {
    items: CartItem[];
    total: number;
    itemCount: number;
} 