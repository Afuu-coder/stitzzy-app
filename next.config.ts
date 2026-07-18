import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        // Firebase Storage
        protocol: "https",
        hostname:  "firebasestorage.googleapis.com",
      },
      {
        // Placeholder images during development
        protocol: "https",
        hostname:  "placehold.co",
      },
    ],
  },
  compress: true,
  // Expose env variables available at build time
  env: {
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!,
  },
};

export default nextConfig;
