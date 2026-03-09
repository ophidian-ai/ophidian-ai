import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://minlcytryamfmisftlqu.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbmxjeXRyeWFtZm1pc2Z0bHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTAzMTEsImV4cCI6MjA4ODU2NjMxMX0.-68tq8KMoyLtGx6Ge6SCj3fhWYCiEERaJzR_pLDRp6Q",
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
