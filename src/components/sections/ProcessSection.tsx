interface Step {
  num: string;
  icon: React.ReactNode;
  name: string;
  desc: string;
}

interface ProcessSectionProps {
  steps: Step[];
}

export function ProcessSection({ steps }: ProcessSectionProps) {
  return (
    <section style={{ padding: "120px 48px", background: "#000" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "64px" }}>
          <p
            className="reveal text-[11px] font-medium tracking-[0.18em] uppercase mb-4"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            How we work
          </p>
          <h2
            className="reveal-flip reveal-delay-1 font-bold"
            style={{
              fontSize: "clamp(28px, 3vw, 42px)",
              letterSpacing: "-0.025em",
              lineHeight: "1.15",
            }}
          >
            Four steps.<br />
            <em className="not-italic text-primary">Zero confusion.</em>
          </h2>
        </div>

        {/* Process image strip */}
        <div
          className="reveal w-full overflow-hidden rounded-[10px] mb-12 relative"
          style={{ height: "260px" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/about-visual.png"
            alt=""
            className="w-full h-full object-cover block"
            style={{ objectPosition: "center 60%", opacity: 0.55 }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.6) 100%),
                linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.5) 100%)
              `,
            }}
          />
        </div>

        {/* Cards grid */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "rgba(255,255,255,0.06)" }}
        >
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`reveal-scale reveal-delay-${i + 1} relative overflow-hidden`}
              style={{
                background: "#000",
                padding: "40px 32px",
                transition: "background 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#060e06")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#000")}
            >
              {/* Subtle glow corner */}
              <div
                className="absolute pointer-events-none"
                style={{
                  bottom: "-50px",
                  right: "-50px",
                  width: "140px",
                  height: "140px",
                  background: "radial-gradient(circle, rgba(57,255,20,0.05) 0%, transparent 70%)",
                  borderRadius: "50%",
                }}
              />
              <span
                className="block text-[11px] tracking-[0.1em] mb-8"
                style={{ color: "rgba(57,255,20,0.4)" }}
              >
                {step.num}
              </span>
              <div
                className="mb-5 opacity-40"
                style={{ width: "32px", height: "32px" }}
              >
                {step.icon}
              </div>
              <div
                className="text-[17px] font-semibold tracking-[-0.01em] mb-3"
              >
                {step.name}
              </div>
              <div
                className="text-[13px] font-light leading-loose"
                style={{ color: "rgba(255,255,255,0.3)", lineHeight: "1.75" }}
              >
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
