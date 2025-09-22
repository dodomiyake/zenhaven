// frontend/next.config.mjs
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            { source: "/api/auth/:path*", destination: "/api/auth/:path*" }, // NextAuth on Amplify
            { source: "/api/webhook", destination: "/api/webhook" },         // Stripe on Amplify
            { source: "/api/:path*", destination: `${backendUrl}/api/:path*` }, // all other API → Render
        ];
    },
    eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
