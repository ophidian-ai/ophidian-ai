import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  robots: "noindex, nofollow",
};

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
