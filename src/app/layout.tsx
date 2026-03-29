import type { Metadata } from "next";
import { Inter, Space_Mono, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/JsonLd";
import { ChatbotPanel } from "@/components/chatbot/ChatbotPanel";
import { EditModeProvider } from "@/lib/edit-mode-context";
import { EditModeToolbar } from "@/components/editable/edit-mode-toolbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

// Self-hosted wordmark font — file provided by Eric (assets/branding_guide/Romantically.woff2)
// Falls back to cursive until the file is present.
const romantically = localFont({
  src: "../../assets/branding_guide/Romantically.woff2",
  variable: "--font-romantically",
  display: "swap",
  preload: false, // don't error on missing file during build
});

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
        className={`${inter.variable} ${spaceMono.variable} ${playfair.variable} ${romantically.variable} antialiased`}
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
