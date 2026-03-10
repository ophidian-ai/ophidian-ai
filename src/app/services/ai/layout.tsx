import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Services (Coming Soon)",
  description:
    "AI integration services including chatbots, workflow automation, and custom AI solutions. Coming soon from OphidianAI.",
};

export default function AIServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
