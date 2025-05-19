"use client";

import Link from "next/link";
import { ShoppingCart, User, Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";


export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const cart = useCartStore((state) => state.cart);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);


    return (
        <header className="bg-white border-b shadow-sm">
            <div className="max-w-screen mx-auto px-6 lg:px-20 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold text-gray-700">
                    ZenHaven
                </Link>

                {/* Desktop Links */}
                <nav className="hidden md:flex gap-6 text-sm text-gray-700 font-medium">
                    <Link href="/">Home</Link>
                    <Link href="/products">Shop</Link>
                    <Link href="/about">About</Link>
                    <Link href="/contact">Contact</Link>
                </nav>

                {/* Icons */}
                <div className="flex gap-8 items-center text-gray-700">
                    {/* ✅ Wrap Cart Icon with Link */}
                    <Link href="/cart">
                        <div className="relative">
                            <ShoppingCart size={20} className="cursor-pointer" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </div>
                    </Link>
                    <Heart size={20} className="cursor-pointer" />
                    <User size={20} className="cursor-pointer" />

                    {/* Mobile Menu Icon */}
                    <button
                        className="md:hidden ml-2"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Links Dropdown */}
            {menuOpen && (
                <div className="md:hidden px-6 pt-2 pb-4 text-sm font-medium text-gray-700 space-y-3 bg-white shadow">
                    <Link href="/" className="block" onClick={() => setMenuOpen(false)}>
                        Home
                    </Link>
                    <Link href="/products" className="block" onClick={() => setMenuOpen(false)}>
                        Shop
                    </Link>
                    <Link href="/about" className="block" onClick={() => setMenuOpen(false)}>
                        About
                    </Link>
                    <Link href="/contact" className="block" onClick={() => setMenuOpen(false)}>
                        Contact
                    </Link>
                    <Link href="/cart" className="block" onClick={() => setMenuOpen(false)}>
                        Cart
                    </Link> {/* ✅ NEW */}
                </div>
            )}
        </header>
    );
}
