import { Brain, PenTool } from "lucide-react";

export function ServicesShowcase() {
  return (
    <section className="py-40 px-8 relative">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="mb-32 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-2xl">
            <span
              className="text-[10px] uppercase tracking-[0.4em] mb-6 block"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
            >
              What We Do
            </span>
            <h2
              className="font-display italic text-6xl md:text-7xl"
              style={{ color: "var(--color-on-surface)" }}
            >
              Built to <br />Perform.
            </h2>
          </div>
          <p
            className="max-w-sm font-light italic leading-relaxed"
            style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }}
          >
            Two core offerings that help small businesses compete online — high-performance websites and AI-powered marketing.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* AI Content Engine */}
          <div className="glass-card p-12 md:p-16 rounded-3xl flex flex-col justify-between group relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ background: "radial-gradient(circle, rgba(170,208,173,0.1) 0%, transparent 70%)" }}
            />
            <div className="relative z-10 space-y-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(170,208,173,0.1)" }}
              >
                <Brain className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
              </div>
              <h3 className="font-display italic text-4xl" style={{ color: "var(--color-on-surface)" }}>
                AI Marketing &amp; Chatbots
              </h3>
              <p className="text-lg leading-relaxed font-light" style={{ color: "var(--color-on-surface-variant)", opacity: 0.8 }}>
                AI chatbots that answer customer questions 24/7, plus automated content and SEO that keep your business visible online without extra work.
              </p>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-4 mt-16">
              <div className="p-4 rounded-lg" style={{ background: "rgba(5,23,11,0.4)" }}>
                <span className="text-[8px] uppercase tracking-widest block mb-2" style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}>Service 01</span>
                <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)" }}>AI CHATBOTS</span>
              </div>
              <div className="p-4 rounded-lg" style={{ background: "rgba(5,23,11,0.4)" }}>
                <span className="text-[8px] uppercase tracking-widest block mb-2" style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}>Service 02</span>
                <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)" }}>CONTENT &amp; SEO</span>
              </div>
            </div>
          </div>

          {/* Premium Web Design */}
          <div className="space-y-12 lg:pt-24">
            <div className="glass-card p-12 md:p-16 rounded-3xl transition-colors">
              <div className="space-y-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(196,162,101,0.1)" }}
                >
                  <PenTool className="w-8 h-8" style={{ color: "var(--color-secondary)" }} />
                </div>
                <h3 className="font-display italic text-4xl" style={{ color: "var(--color-on-surface)" }}>
                  Custom Websites
                </h3>
                <p className="text-lg leading-relaxed font-light" style={{ color: "var(--color-on-surface-variant)", opacity: 0.8 }}>
                  Fast, mobile-friendly websites built from scratch — not templates. Designed to load in under 2 seconds and turn visitors into customers.
                </p>
                <ul className="space-y-4 pt-4">
                  <li className="flex items-center gap-4 text-[10px] tracking-widest" style={{ fontFamily: "var(--font-mono)", color: "rgba(170,208,173,0.7)" }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: "var(--color-secondary)" }} />
                    95+ LIGHTHOUSE SCORES
                  </li>
                  <li className="flex items-center gap-4 text-[10px] tracking-widest" style={{ fontFamily: "var(--font-mono)", color: "rgba(170,208,173,0.7)" }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: "var(--color-secondary)" }} />
                    MOBILE-FIRST DESIGN
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
