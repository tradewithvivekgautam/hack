import path from "node:path";
import type { NextConfig } from "next";

const sharedDistPath = path.resolve(__dirname, "../../packages/shared/dist/index.js");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  output: process.env.BUILD_STANDALONE ? "standalone" : undefined,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@agentic-rwa/shared",
    "ox",
    "@noble/hashes",
    "@noble/curves",
    "@noble/post-quantum",
    "viem",
  ],
  turbopack: {
    resolveAlias: {
      "@agentic-rwa/shared": sharedDistPath,
      "@noble/curves/utils.js": "@noble/curves/abstract/utils",
      "@noble/curves/secp256k1.js": "@noble/curves/secp256k1",
      "@noble/hashes/sha2.js": "@noble/hashes/sha256",
      "@noble/hashes/sha3.js": "@noble/hashes/sha3",
      "@noble/hashes/legacy.js": "@noble/hashes/ripemd160",
      "@noble/hashes/blake3.js": "@noble/hashes/blake3",
      "@noble/hashes/hmac.js": "@noble/hashes/hmac",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@agentic-rwa/shared": sharedDistPath,
      "@react-native-async-storage/async-storage": false,
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
};

export default nextConfig;
