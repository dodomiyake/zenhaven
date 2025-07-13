'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Package, Settings, Users, LogOut } from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const isAdmin = localStorage.getItem('isAdmin') === 'true';
                setIsAuthenticated(isAdmin);

                // If not authenticated and not on login page, redirect to login
                if (!isAdmin && pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
                if (pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        setIsAuthenticated(false);
        router.push('/admin/login');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // If on login page, render children without admin layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // If not authenticated, don't render anything (redirect will happen)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300`}>
                <div className="p-4 flex justify-between items-center">
                    <h2 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>Admin</h2>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded">
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="mt-8">
                    <Link
                        href="/admin/products"
                        className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                    >
                        <Package size={20} />
                        {sidebarOpen && <span className="ml-4">Products</span>}
                    </Link>
                    <Link
                        href="/admin/orders"
                        className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                    >
                        <Package size={20} />
                        {sidebarOpen && <span className="ml-4">Orders</span>}
                    </Link>

                    <Link
                        href="/admin/settings"
                        className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                    >
                        <Settings size={20} />
                        {sidebarOpen && <span className="ml-4">Settings</span>}
                    </Link>
                    <Link
                        href="/admin/customers"
                        className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                    >
                        <Users size={20} />
                        {sidebarOpen && <span className="ml-4">Customers</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="ml-4">Logout</span>}
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto">
                <header className="bg-white shadow">
                    <div className="px-4 py-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                    </div>
                </header>

                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
} 