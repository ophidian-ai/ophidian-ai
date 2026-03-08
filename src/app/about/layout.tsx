import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about OphidianAI -- an AI agency helping small and mid-size businesses automate operations with practical AI integrations.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
