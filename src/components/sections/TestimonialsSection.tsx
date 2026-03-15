interface Testimonial {
  num: string;
  avatar: string;
  avatarAlt: string;
  quote: string;
  name: string;
  role: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ padding: "120px 48px", background: "#0b1a0b" }}
    >
      {/* Faint glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(57,255,20,0.05) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative"
        style={{ zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "64px" }}>
          <h2
            className="reveal-flip font-bold"
            style={{
              fontSize: "clamp(28px, 3vw, 42px)",
              letterSpacing: "-0.025em",
              lineHeight: "1.15",
            }}
          >
            What clients<br />say.
          </h2>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {testimonials.map((t, i) => (
            <div
              key={t.num}
              className={`reveal-left${i > 0 ? ` reveal-delay-${Math.min(i * 2, 5)}` : ""} grid items-start gap-7 py-10`}
              style={{
                gridTemplateColumns: "56px auto 1fr",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.05)" : undefined,
              }}
            >
              <span
                className="text-[11px] tracking-[0.05em] pt-1.5"
                style={{ color: "rgba(255,255,255,0.15)" }}
              >
                {t.num}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.avatar}
                alt={t.avatarAlt}
                className="rounded-full object-cover flex-shrink-0"
                style={{
                  width: "48px",
                  height: "48px",
                  opacity: 0.75,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
              <div>
                <p
                  className="font-light leading-loose mb-4"
                  style={{
                    fontSize: "16px",
                    color: "rgba(255,255,255,0.65)",
                    lineHeight: "1.75",
                    letterSpacing: "0.005em",
                  }}
                >
                  "{t.quote}"
                </p>
                <div className="flex gap-2 items-center">
                  <span
                    className="text-[12px] font-medium tracking-[0.04em]"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {t.name}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "12px" }}>·</span>
                  <span
                    className="text-[12px] font-light tracking-[0.03em]"
                    style={{ color: "rgba(57,255,20,0.4)" }}
                  >
                    {t.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
