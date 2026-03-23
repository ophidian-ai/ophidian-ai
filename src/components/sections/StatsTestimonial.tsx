import Image from "next/image";

export function StatsTestimonial() {
  return (
    <section className="py-40 px-8 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
        {/* Left: Stats */}
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-6">
            <span
              className="text-[10px] uppercase tracking-[0.5em] block"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
            >
              Systemic Synthesis
            </span>
            <h2
              className="font-display italic text-5xl md:text-6xl leading-tight"
              style={{ color: "var(--color-on-surface)" }}
            >
              Growth <br />Metrics
            </h2>
            <p
              className="font-light leading-relaxed max-w-md italic"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Quantifiable evolution through strategic biological integration and machine precision.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <div style={{ borderLeft: "1px solid rgba(170,208,173,0.2)", paddingLeft: "1.5rem" }}>
              <div className="text-5xl" style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)" }}>94%</div>
              <div
                className="text-[9px] uppercase tracking-widest mt-3"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
              >
                Retention Rate
              </div>
            </div>
            <div style={{ borderLeft: "1px solid rgba(170,208,173,0.2)", paddingLeft: "1.5rem" }}>
              <div className="text-5xl" style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)" }}>
                2.4<span className="text-2xl">s</span>
              </div>
              <div
                className="text-[9px] uppercase tracking-widest mt-3"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
              >
                Neural Latency
              </div>
            </div>
          </div>
        </div>

        {/* Right: Testimonial */}
        <div className="lg:col-span-7">
          <div className="glass-card p-12 md:p-16 rounded-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl transition-all duration-700" style={{ background: "rgba(170,208,173,0.1)" }} />
            <blockquote className="relative z-10 text-center">
              <p
                className="font-display italic text-3xl md:text-5xl leading-snug mb-12"
                style={{ color: "var(--color-on-surface)" }}
              >
                &ldquo;OphidianAI didn&apos;t just build a website; they grew a digital organism that understands our customers better than we do.&rdquo;
              </p>
              <footer className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden grayscale" style={{ border: "1px solid rgba(170,208,173,0.2)" }}>
                  <Image
                    src="/images/gallery/marble.jpg"
                    alt="Client"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <div
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)" }}
                  >
                    Dr. Alistair Thorne
                  </div>
                  <div
                    className="text-[8px] uppercase tracking-widest mt-1"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--color-on-surface-variant)", opacity: 0.5 }}
                  >
                    CEO, BioNeural Systems
                  </div>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
