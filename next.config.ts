import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { allowedOrigins: ["*"] } },
  images: { domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"] }
};

export default nextConfig;
