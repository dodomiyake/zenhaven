"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white border-b shadow-sm">
            <div className="max-w-dvw mx-auto px-8 py-5 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                    ZenHaven
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
                    <Link href="/products" className="hover:text-blue-600">Products</Link>
                    <Link href="/cart" className="hover:text-blue-600">Cart</Link>
                    <Link href="/profile" className="hover:text-blue-600">Profile</Link>
                </div>

                {/* Mobile Menu Icon */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden focus:outline-none"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Links */}
            {isOpen && (
                <div className="md:hidden px-4 pb-4 space-y-3 text-sm font-medium text-gray-700">
                    <Link href="/products" className="block hover:text-blue-600" onClick={() => setIsOpen(false)}>Products</Link>
                    <Link href="/cart" className="block hover:text-blue-600" onClick={() => setIsOpen(false)}>Cart</Link>
                    <Link href="/profile" className="block hover:text-blue-600" onClick={() => setIsOpen(false)}>Profile</Link>
                </div>
            )}
        </nav>
    );
}
