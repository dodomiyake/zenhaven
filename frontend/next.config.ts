import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // keep Next’s own API routes on Amplify
      { source: "/api/auth/:path*", destination: "/api/auth/:path*" }, // NextAuth
      { source: "/api/webhook", destination: "/api/webhook" },         // Stripe

      // proxy the rest to your Render backend
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
    ];
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
