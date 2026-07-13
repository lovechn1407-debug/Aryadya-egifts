import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://aradhyagifts.in/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
