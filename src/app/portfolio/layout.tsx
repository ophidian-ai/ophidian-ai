import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "See our work. Real AI integration and web development projects built for real businesses.",
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
