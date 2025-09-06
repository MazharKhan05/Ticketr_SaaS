import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "scintillating-skunk-303.convex.cloud",
        protocol: "https",
      },
      {
        hostname: "fast-chihuahua-451.convex.cloud",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
