import type { NextConfig } from "next";

/** Spring Boot backend. The browser never calls it directly: Next.js forwards /api/* to it. */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  // Dev mode only trusts "localhost". Without this, opening the app as 127.0.0.1 or from your
  // network IP loads the page but blocks its JavaScript — so no button works.
  allowedDevOrigins: ["127.0.0.1", "0.0.0.0", "*.local", "192.168.*.*", "10.*.*.*", "172.*.*.*"],
  // No Next.js dev bubble on screen. Build/runtime errors still show as an overlay in dev.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Same-origin proxy → no CORS setup needed in Spring.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
