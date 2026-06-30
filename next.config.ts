import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
  serverExternalPackages: ["@electric-sql/pglite", "maxmind"],
  outputFileTracingIncludes: {
    "/api/visits": ["./data/ip66.mmdb"],
  },
};

export default nextConfig;
