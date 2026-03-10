import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Design & SEO Services",
  description:
    "Professional web design and SEO services for small businesses. Custom websites starting at $2,200. Free SEO audits available.",
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
