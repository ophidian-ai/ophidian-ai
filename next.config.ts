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
  async headers() {
    return [
      {
        source: "/((?!chat/).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
