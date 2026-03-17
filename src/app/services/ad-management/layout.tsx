import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Ad Management for Small Business | OphidianAI",
  description:
    "AI-optimized Google Ads and Meta Ads management with smart bidding, creative testing, and performance reporting. Starting at $399/mo.",
  keywords: ["AI ad management", "Google Ads management", "Meta Ads", "PPC management"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
