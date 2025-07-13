"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, rememberMe }),
                credentials: "include"
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || (data.errors && data.errors[0]?.msg) || "Login failed");
            } else {
                setSuccess("Login successful! Redirecting...");
                await refreshUser();
                setTimeout(() => router.push("/"), 1200);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Placeholder for Google login
    const handleGoogleLogin = () => {
        alert("Google login coming soon! (Requires OAuth setup)");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="mr-2"
                        />
                        <label htmlFor="rememberMe" className="text-sm">Remember Me</label>
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    {success && <div className="text-green-600 text-sm">{success}</div>}
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-700 transition"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>
                <div className="my-4 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">or</span>
                </div>
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded font-semibold hover:bg-gray-100 transition text-gray-700"
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" className="w-5 h-5" />
                    Continue with Google
                </button>
                <p className="mt-4 text-sm text-center">
                    Don't have an account?{' '}
                    <a href="/auth/register" className="text-blue-600 hover:underline">Register</a>
                </p>
            </div>
        </div>
    );
} 