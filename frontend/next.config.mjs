/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const nextConfig = {
    async rewrites() {
        return [
            { source: '/api/auth/:path*', destination: '/api/auth/:path*' },   // NextAuth in Next
            { source: '/api/webhook', destination: '/api/webhook' },       // Stripe webhook in Next

            // Keep products in Next (your pages/api/products.ts)
            { source: '/api/products', destination: '/api/products' },
            { source: '/api/products/:path*', destination: '/api/products/:path*' },

            // Everything else to backend (Render)
            { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
        ];
    },
    eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
