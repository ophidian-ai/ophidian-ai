import type { Metadata } from "next";
import { Ballet, Gruppo, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/JsonLd";
import { ChatbotPanel } from "@/components/chatbot/ChatbotPanel";
import { EditModeProvider } from "@/lib/edit-mode-context";
import { EditModeToolbar } from "@/components/editable/edit-mode-toolbar";
import "./globals.css";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Ballet — Google Font, variable, used for all headings (h1–h6)
// Variable `--font-playfair` kept so globals.css picks it up unchanged.
const ballet = Ballet({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// Gruppo — Google Font, body text
// Variable `--font-inter` kept so globals.css picks it up unchanged.
const gruppo = Gruppo({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Romantically.woff2 — not yet provided; --font-wordmark falls back to cursive in globals.css

export const metadata: Metadata = {
  metadataBase: new URL("https://ophidianai.com"),
  title: {
    default: "OphidianAI — Where the natural world meets innovation.",
    template: "%s | OphidianAI",
  },
  description:
    "A premium AI-powered digital studio. We build high-performance websites, native mobile apps, and AI-driven SaaS tools for businesses that want to stand out.",
  keywords: ["AI", "web design", "digital studio", "AI agency", "SaaS", "small business"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "OphidianAI",
    title: "OphidianAI | Intelligence. Engineered.",
    description:
      "AI agency and integrations company. We build intelligent systems that transform how businesses operate.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OphidianAI - Intelligence. Engineered.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OphidianAI | Intelligence. Engineered.",
    description:
      "AI agency and integrations company. We build intelligent systems that transform how businesses operate.",
    images: ["/og-image.png"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "OphidianAI",
  description: "AI agency and integrations company",
  url: "https://ophidianai.com",
  founder: { "@type": "Person", name: "Eric Lefler" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Columbus",
    addressRegion: "IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ballet.variable} ${gruppo.variable} ${spaceMono.variable} antialiased`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <JsonLd data={organizationSchema} />
        <EditModeProvider>
          {children}
          <ChatbotPanel />
          <EditModeToolbar />
        </EditModeProvider>
        <Analytics />
      </body>
    </html>
  );
}
