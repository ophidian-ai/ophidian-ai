import Link from "next/link";

export function CTASection() {
  return (
    <section
      className="text-center relative overflow-hidden"
      style={{ padding: "180px 48px" }}
    >
      {/* Glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: `
            radial-gradient(ellipse 70% 60% at 50% 50%, rgba(57,255,20,0.04) 0%, transparent 70%),
            linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.5) 100%)
          `,
        }}
      />

      <div className="relative" style={{ zIndex: 2 }}>
        <p
          className="reveal text-[11px] font-medium tracking-[0.2em] uppercase mb-6"
          style={{ color: "rgba(57,255,20,0.4)" }}
        >
          Let's build something
        </p>

        <h2
          className="reveal-flip reveal-delay-1 font-extrabold mx-auto"
          style={{
            fontSize: "clamp(40px, 5.5vw, 72px)",
            letterSpacing: "-0.03em",
            lineHeight: "1.05",
            maxWidth: "640px",
          }}
        >
          Ready to{" "}
          <em className="not-italic text-primary">evolve?</em>
        </h2>

        <p
          className="reveal reveal-delay-2 mt-6 font-light leading-loose mx-auto"
          style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.4)",
            maxWidth: "420px",
            lineHeight: "1.75",
          }}
        >
          Book a free 30-minute discovery call. We'll map out exactly what you
          need — no pitch, no pressure.
        </p>

        <div className="reveal reveal-delay-3 mt-12 flex gap-4 items-center justify-center">
          <Link
            href="/contact"
            className="inline-block bg-primary text-black text-[12px] font-bold tracking-[0.08em] uppercase px-7 py-[14px] rounded-full transition-opacity hover:opacity-85"
          >
            Book a Free Call
          </Link>
          <Link
            href="mailto:eric.lefler@ophidianai.com"
            className="text-[13px] font-light flex items-center gap-2 transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Or email us <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
