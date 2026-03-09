import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "minlcytryamfmisftlqu.supabase.co" },
      { protocol: "https", hostname: "randomuser.me" },
    ],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
