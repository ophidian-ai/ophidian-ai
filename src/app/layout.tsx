import type { Metadata } from "next";
import { Inter, Space_Mono, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/JsonLd";
import AIChatWidget from "@/components/ui/ai-orb";
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
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ophidianai.com"),
  title: {
    default: "OphidianAI | Intelligence. Engineered.",
    template: "%s | OphidianAI",
  },
  description:
    "AI agency and integrations company. We build intelligent systems that transform how businesses operate.",
  keywords: ["AI", "artificial intelligence", "AI agency", "AI integrations", "automation"],
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
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceMono.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        <JsonLd data={organizationSchema} />
        <EditModeProvider>
          <div className="relative z-10">
            {children}
          </div>
          <AIChatWidget />
          <EditModeToolbar />
        </EditModeProvider>
        <Analytics />
      </body>
    </html>
  );
}
