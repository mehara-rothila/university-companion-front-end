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
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/upload/image/serve/**',
      },
      {
        protocol: 'https',
        hostname: '*.herokuapp.com',
        pathname: '/api/upload/image/serve/**',
      },
      {
        protocol: 'https',
        hostname: '*.mehara.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
