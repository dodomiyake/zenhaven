"use client";

import Link from "next/link";
import { ShoppingCart, User, Heart, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

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
                <div className="flex gap-4 items-center text-gray-700">
                    {/* ✅ Wrap Cart Icon with Link */}
                    <Link href="/cart">
                        <ShoppingCart size={20} className="cursor-pointer" />
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
