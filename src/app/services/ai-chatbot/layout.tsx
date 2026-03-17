import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Chatbot for Small Business | OphidianAI",
  description:
    "Custom AI chatbot trained on your business data. Capture leads, book appointments, and answer customer questions 24/7. Starting at $149/mo.",
  keywords: ["AI chatbot", "business chatbot", "lead capture chatbot", "customer support bot"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
