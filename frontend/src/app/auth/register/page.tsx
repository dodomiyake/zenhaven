"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CLOUDINARY_UPLOAD_PRESET = "your_upload_preset"; // Replace with your Cloudinary unsigned upload preset
const CLOUDINARY_CLOUD_NAME = "your_cloud_name"; // Replace with your Cloudinary cloud name

async function uploadToCloudinary(file: File): Promise<string | null> {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
        const res = await fetch(url, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        return data.secure_url || null;
    } catch {
        return null;
    }
}

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
        avatar: ""
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Client-side validation
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }
        if (form.phone && !/^\d{7,15}$/.test(form.phone)) {
            setError("Phone must be 7-15 digits");
            setLoading(false);
            return;
        }
        if (form.address && form.address.length > 100) {
            setError("Address must be at most 100 characters");
            setLoading(false);
            return;
        }

        let avatarUrl = form.avatar;
        if (avatarFile) {
            avatarUrl = await uploadToCloudinary(avatarFile) || "";
            if (!avatarUrl) {
                setError("Failed to upload avatar image.");
                setLoading(false);
                return;
            }
        }

        try {
            const payload: any = { ...form };
            if (avatarUrl) {
                payload.avatar = avatarUrl;
            } else {
                delete payload.avatar;
            }

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || (data.errors && data.errors[0]?.msg) || "Registration failed");
            } else {
                setSuccess("Registration successful! Redirecting to login...");
                setTimeout(() => router.push("/auth/login"), 1500);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
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
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            pattern="\d{7,15}"
                            maxLength={15}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            maxLength={100}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Avatar</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
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
                            minLength={6}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    {success && <div className="text-green-600 text-sm">{success}</div>}
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-700 transition"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
                <p className="mt-4 text-sm text-center">
                    Already have an account?{' '}
                    <a href="/auth/login" className="text-blue-600 hover:underline">Login</a>
                </p>
            </div>
        </div>
    );
} 