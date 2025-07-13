"use client";

import Link from "next/link";
import { ShoppingCart, User, Heart, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/components/AuthContext";

interface UserInfo {
    name: string;
    email: string;
    avatar?: string;
}

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);
    const { user, loading, logout } = useAuth();
    const cart = useCartStore((state) => state.cart);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

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

                {/* Icons & Auth */}
                <div className="flex gap-8 items-center text-gray-700">
                    {/* Cart Icon */}
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

                    {/* Auth Links/User Info */}
                    {loading ? null : user ? (
                        <div className="relative" ref={avatarRef}>
                            <button
                                className="flex items-center gap-2 focus:outline-none"
                                onClick={() => setDropdownOpen((open) => !open)}
                                aria-label="User menu"
                            >
                                {user.avatar ? (
                                    <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-gray-300" />
                                ) : (
                                    <User size={24} className="rounded-full bg-gray-200 p-1" />
                                )}
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-lg z-50">
                                    <div className="px-4 py-2 text-sm text-gray-700 border-b">{user.name}</div>
                                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => { setDropdownOpen(false); logout(); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/auth/login" className="hover:underline">Login</Link>
                            <Link href="/auth/register" className="hover:underline">Register</Link>
                        </div>
                    )}

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
                    </Link>
                    {/* Auth Links for Mobile */}
                    {loading ? null : user ? (
                        <button onClick={logout} className="block w-full text-left text-red-600 mt-2">Logout</button>
                    ) : (
                        <>
                            <Link href="/auth/login" className="block" onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link href="/auth/register" className="block" onClick={() => setMenuOpen(false)}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
