import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "igsu4gwhfikaeymp.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
