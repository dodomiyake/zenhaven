"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
            ZenHaven
            </Link>
            <div className="space-x-6 text-sm font-medium text-gray-700">
                <Link href="/products" className="hover:text-blue-600">
                    Products
                </Link>
                <Link href="/cart" className="hover:text-blue-600">
                    Cart
                </Link>
                <Link href="/profile" className="hover:text-blue-600">
                    Profile
                </Link>
            </div>
        </nav>
    )
}