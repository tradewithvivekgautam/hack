import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: [
    "@agentic-rwa/shared",
    "ox",
    "@noble/hashes",
    "@noble/curves",
    "@noble/post-quantum",
    "viem",
  ],
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@noble/curves/utils.js": "@noble/curves/abstract/utils",
      "@noble/curves/secp256k1.js": "@noble/curves/secp256k1",
      "@noble/hashes/sha2.js": "@noble/hashes/sha256",
      "@noble/hashes/sha3.js": "@noble/hashes/sha3",
      "@noble/hashes/legacy.js": "@noble/hashes/ripemd160",
      "@noble/hashes/blake3.js": "@noble/hashes/blake3",
      "@noble/hashes/hmac.js": "@noble/hashes/hmac",
    };
    return config;
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react"],
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
};

export default nextConfig;
