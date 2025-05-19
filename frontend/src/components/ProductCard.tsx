// src/components/ProductCard.tsx
"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cartStore";

interface Product {
    _id: string;
    title: string;
    price: string;
    image: string;
}

export default function ProductCard({ product }: { product: Product }) {
    const addToCart = useCartStore((state) => state.addToCart);
    

    return (
        <div className="border rounded-md shadow p-4 flex flex-col items-center">
            <Image
                src={product.image}
                alt={product.title}
                width={300}
                height={300}
                className="w-full h-60 object-cover rounded"
            />
            <h3 className="text-lg font-semibold mt-2">{product.title}</h3>
            <p className="text-gray-700 mb-2">{product.price}</p>
            <button
                onClick={() => {
                    addToCart(product);
                    alert(`${product.title} added to cart!`);
                }}
                className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition"
            >
                Add to Cart
            </button>
        </div>
    );
}
