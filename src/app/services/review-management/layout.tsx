import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Review Management for Small Business | OphidianAI",
  description:
    "Multi-platform review monitoring, AI-drafted responses, and review generation campaigns. Starting at $249/mo.",
  keywords: ["review management", "AI review responses", "Google reviews", "reputation management"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
