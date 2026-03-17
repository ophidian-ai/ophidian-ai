import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI CRM Automation for Small Business | OphidianAI",
  description:
    "Automated lead scoring, follow-up sequences, and pipeline management powered by AI. Starting at $297/mo.",
  keywords: ["CRM automation", "AI CRM", "lead scoring", "pipeline management", "small business CRM"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
