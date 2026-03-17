import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI SEO Automation for Small Business | OphidianAI",
  description:
    "Automated SEO audits, keyword tracking, content optimization, and monthly reporting powered by AI. Starting at $299/mo.",
  keywords: ["SEO automation", "AI SEO", "small business SEO", "local SEO"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
