import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Content Generation for Small Business | OphidianAI",
  description:
    "AI-powered blog posts, social media content, and email sequences written in your brand voice. Starting at $149/mo.",
  keywords: ["AI content generation", "blog writing service", "social media content", "small business content"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
