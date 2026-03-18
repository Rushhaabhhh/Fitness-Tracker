import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  experimental: { serverActions: { allowedOrigins: ["*"] } },
  images: { domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"] }
};

export default withPWA(nextConfig);
