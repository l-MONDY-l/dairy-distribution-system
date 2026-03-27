import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy /api to backend so login works when app is opened via ngrok (same-origin /api)
    const backend =
      process.env.API_SERVER_URL || "http://localhost:3001";
    const base = backend.replace(/\/$/, "");
    return [{ source: "/api/:path*", destination: `${base}/:path*` }];
  },
};

export default nextConfig;
