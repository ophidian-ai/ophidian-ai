import Link from "next/link";

export function AboutStrip() {
  return (
    <section
      className="relative overflow-hidden flex items-end"
      style={{ height: "60vh", minHeight: "400px" }}
    >
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/about-visual.png"
          alt=""
          className="w-full block object-cover"
          style={{
            height: "115%",
            objectPosition: "center 30%",
            transform: "translateY(-7.5%)",
            willChange: "transform",
          }}
        />
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%),
            linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 60%)
          `,
        }}
      />

      {/* Content */}
      <div
        className="relative"
        style={{ zIndex: 10, padding: "0 48px 64px", maxWidth: "700px" }}
      >
        <span className="reveal-rise-wrap">
          <span
            className="reveal-rise block text-[11px] font-medium tracking-[0.2em] uppercase mb-4"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            About OphidianAI
          </span>
        </span>

        <h2
          className="reveal-flip reveal-delay-1 font-bold"
          style={{
            fontSize: "clamp(28px, 4vw, 52px)",
            letterSpacing: "-0.025em",
            lineHeight: "1.1",
          }}
        >
          One studio.<br />
          Full-stack delivery.
        </h2>

        <p
          className="reveal reveal-delay-2 mt-4 font-light leading-loose"
          style={{
            fontSize: "15px",
            color: "rgba(255,255,255,0.5)",
            maxWidth: "480px",
            lineHeight: "1.8",
          }}
        >
          OphidianAI is a solo AI agency based in Columbus, Indiana. One person,
          fully AI-augmented — which means your project gets senior attention at
          every stage, not handed off to a junior team.
        </p>

        <Link
          href="/about"
          className="reveal reveal-delay-3 mt-6 inline-flex items-center gap-2 text-[13px] transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Learn more <span>→</span>
        </Link>
      </div>
    </section>
  );
}
