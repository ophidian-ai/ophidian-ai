import Link from "next/link";

interface Service {
  num: string;
  name: string;
  desc: string;
  href?: string;
}

interface ServicesSectionProps {
  services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section style={{ padding: "120px 48px", position: "relative", overflow: "hidden" }}>
      <div
        className="relative grid gap-20 items-start mx-auto"
        style={{
          gridTemplateColumns: "1fr 1fr",
          maxWidth: "1200px",
          zIndex: 1,
        }}
      >
        {/* Left: headline + copy */}
        <div>
          <div className="reveal-flip">
            <p
              className="text-[11px] font-medium tracking-[0.2em] uppercase mb-5"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              What we build
            </p>
            <h2
              className="font-bold text-white"
              style={{
                fontSize: "clamp(32px, 3.5vw, 50px)",
                letterSpacing: "-0.025em",
                lineHeight: "1.12",
              }}
            >
              Tools that<br />
              grow{" "}
              <em className="not-italic text-primary">with you.</em>
            </h2>
            <p
              className="mt-5 font-light leading-loose"
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.45)",
                maxWidth: "360px",
                lineHeight: "1.8",
              }}
            >
              Organic systems adapt. Evolve. Strengthen over time. We build AI tools
              and digital infrastructure that do the same — growing smarter with every
              interaction.
            </p>
            <Link
              href="/services"
              className="mt-9 inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.1em] uppercase text-primary opacity-70 hover:opacity-100 transition-opacity"
            >
              View all services →
            </Link>
          </div>
        </div>

        {/* Right: service rows */}
        <div className="flex flex-col">
          {services.map((service, i) => (
            <Link
              key={service.num}
              href={service.href ?? "#"}
              className={`reveal-right reveal-delay-${i + 1} grid items-center gap-5 py-[26px] cursor-pointer no-underline text-inherit group`}
              style={{
                gridTemplateColumns: "44px 1fr 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : undefined,
              }}
            >
              <span
                className="text-[11px] font-normal tabular-nums"
                style={{ color: "rgba(255,255,255,0.18)" }}
              >
                {service.num}
              </span>
              <div>
                <div
                  className="text-[17px] font-medium tracking-[-0.01em] transition-colors group-hover:text-primary"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {service.name}
                </div>
                <div
                  className="mt-1 text-[13px] font-light leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                >
                  {service.desc}
                </div>
              </div>
              <span
                className="text-[18px] justify-self-end transition-all group-hover:translate-x-[5px] group-hover:text-primary"
                style={{ color: "rgba(255,255,255,0.15)" }}
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
