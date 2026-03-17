import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Design, SEO & AI Growth Services",
  description:
    "Professional web design, SEO, and AI-powered growth services for small businesses. Custom websites, AI chatbots, content generation, email marketing, and more.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
