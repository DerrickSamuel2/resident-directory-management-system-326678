import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Authenticated and personalized experiences require dynamic rendering.
  // Static export would break API routes, middleware, and cookie-based auth.
  output: "standalone",
};

export default nextConfig;
