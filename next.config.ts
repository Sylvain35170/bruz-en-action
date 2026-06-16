import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/bruz-en-action",
  images: { unoptimized: true },
};

export default nextConfig;
