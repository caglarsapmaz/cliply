import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Docker/Render deploy: traces only the node_modules actually needed
  // into .next/standalone, keeping the runtime image small.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.ytimg.com" },
      { protocol: "https", hostname: "ytimg.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
