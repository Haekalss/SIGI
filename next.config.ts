import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' 'inline-speculation-rules' https://apis.google.com",
      "connect-src 'self' https://api.openweathermap.org https://data.bmkg.go.id",
      "img-src 'self' data: https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'"
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
