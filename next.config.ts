import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@ai-sdk/xai", "@huggingface/transformers", "onnxruntime-node"],
  turbopack: {
    resolveAlias: {
      sharp: "./lib/empty.ts",
      "onnxruntime-node": "./lib/empty.ts",
    },
  },
};

export default nextConfig;
