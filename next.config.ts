import type { NextConfig } from "next";

const storageBaseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL;
const storageRemotePattern = (() => {
  if (!storageBaseUrl) return [];

  try {
    const url = new URL(storageBaseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return [];

    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
      },
    ];
  } catch {
    return [];
  }
})();

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ["postgres", "maxmind"],
  outputFileTracingIncludes: {
    "/api/visits": ["./data/ip66.mmdb"],
  },
  images: {
    remotePatterns: storageRemotePattern,
  },
};

export default nextConfig;
