import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Email Marketing for Small Business | OphidianAI",
  description:
    "AI-personalized email campaigns, automated sequences, and send-time optimization for small businesses. Starting at $249/mo.",
  keywords: ["AI email marketing", "email automation", "small business email", "email campaigns"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
