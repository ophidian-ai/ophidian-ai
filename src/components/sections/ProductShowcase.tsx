"use client";

import { ChatbotMockup } from "@/components/mockups/ChatbotMockup";
import { ContentEngineMockup } from "@/components/mockups/ContentEngineMockup";
import { SEODashboardMockup } from "@/components/mockups/SEODashboardMockup";
import { GlassButton } from "@/components/ui/glass-button";

const products = [
  {
    label: "Product 01",
    title: "AI Chatbots",
    description:
      "Your 24/7 customer service rep. Iris answers questions, captures leads, and books appointments \u2014 all trained on your business.",
    href: "/services/ai-chatbot",
    mockup: <ChatbotMockup />,
  },
  {
    label: "Product 02",
    title: "Content Engine",
    description:
      "AI-generated social posts, blog articles, and email sequences \u2014 written in your brand voice, scheduled automatically.",
    href: "/services/content-generation",
    mockup: <ContentEngineMockup />,
  },
  {
    label: "Product 03",
    title: "SEO & Performance",
    description:
      "Continuous site audits, keyword tracking, and Google Business Profile optimization. Watch your scores climb.",
    href: "/services/seo-automation",
    mockup: <SEODashboardMockup />,
  },
];

export function ProductShowcase() {
  return (
    <section className="py-40 px-8 relative">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="mb-24 text-center max-w-2xl mx-auto">
          <span
            className="text-[10px] uppercase tracking-[0.4em] mb-6 block"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
          >
            See It in Action
          </span>
          <h2
            className="font-display italic text-5xl md:text-7xl mb-6"
            style={{ color: "var(--color-on-surface)" }}
          >
            The AI Actually Works.
          </h2>
          <p
            className="text-lg font-light leading-relaxed"
            style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }}
          >
            Not just buzzwords \u2014 real tools running for real businesses right now.
          </p>
        </div>

        {/* Product cards */}
        <div className="space-y-32">
          {products.map((product, i) => (
            <div
              key={product.label}
              className={`flex flex-col ${
                i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-16 lg:gap-24`}
            >
              {/* Mockup */}
              <div className="w-full lg:w-5/12 flex-shrink-0">
                <div
                  className="relative"
                  style={{
                    filter: "drop-shadow(0 20px 60px rgba(5,23,11,0.4))",
                  }}
                >
                  {/* Glow behind mockup */}
                  <div
                    className="absolute -inset-8 rounded-3xl -z-10"
                    style={{
                      background:
                        i % 2 === 0
                          ? "radial-gradient(ellipse at center, rgba(170,208,173,0.06) 0%, transparent 70%)"
                          : "radial-gradient(ellipse at center, rgba(196,162,101,0.06) 0%, transparent 70%)",
                    }}
                  />
                  {product.mockup}
                </div>
              </div>

              {/* Description */}
              <div className="w-full lg:w-7/12 space-y-6">
                <span
                  className="text-[9px] uppercase tracking-[0.4em] block"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
                >
                  {product.label}
                </span>
                <h3
                  className="font-display italic text-4xl md:text-5xl"
                  style={{ color: "var(--color-on-surface)" }}
                >
                  {product.title}
                </h3>
                <p
                  className="text-lg font-light leading-relaxed max-w-lg"
                  style={{ color: "var(--color-on-surface-variant)", opacity: 0.8 }}
                >
                  {product.description}
                </p>
                <div className="pt-2">
                  <GlassButton href={product.href}>
                    Learn More
                  </GlassButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
