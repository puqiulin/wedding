import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ["postgres", "maxmind"],
  outputFileTracingIncludes: {
    "/api/visits": ["./data/ip66.mmdb"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.sprite3366.com',
      },
    ],
  },
};

export default nextConfig;
