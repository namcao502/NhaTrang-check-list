import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// In dev mode, Next.js needs 'unsafe-eval' for React Refresh and ws:// for HMR
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const connectSrc = isDev
  ? "connect-src 'self' ws: https://api.open-meteo.com https://geocoding-api.open-meteo.com"
  : "connect-src 'self' https://api.open-meteo.com https://geocoding-api.open-meteo.com";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; ${connectSrc}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
