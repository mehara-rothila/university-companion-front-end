import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Font optimization is handled automatically in Next.js 15+
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during builds for deployment
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
