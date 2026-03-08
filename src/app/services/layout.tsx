import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI integration services including chatbots, workflow automation, and custom AI solutions. Subscription-based pricing with continuous improvement.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
