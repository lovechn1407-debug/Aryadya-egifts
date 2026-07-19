import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // Allow Firebase Auth popups to communicate back to the opener window.
            // "same-origin" (the default on some hosts) blocks window.closed / postMessage
            // from the auth popup, causing the spinner to hang forever.
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
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
