"use client";

import Image from "next/image";

interface ProductProps {
    title: string;
    price: string;
    image: string;
}

export default function ProductCard({ title, price, image }: ProductProps) {
    return (
        <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4">
            <div className="relative w-full h-48 mb-4">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover rounded-md"
                />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-800 font-bold text-sm mb-4">{price}</p>
            <button className="w-full bg-gray-700 text-white py-2 rounded hover:bg-black transition text-sm">
                Add to Cart
            </button>
        </div>
    );
}
