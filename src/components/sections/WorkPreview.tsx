import Link from "next/link";

interface WorkCard {
  href: string;
  image: string;
  tag: string;
  title: string;
  sub: string;
}

interface WorkPreviewProps {
  cards: WorkCard[];
}

export function WorkPreview({ cards }: WorkPreviewProps) {
  return (
    <section style={{ padding: "120px 48px", background: "#000" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          className="flex justify-between items-end mb-16"
        >
          <h2
            className="reveal-flip font-bold"
            style={{
              fontSize: "clamp(28px, 3.5vw, 48px)",
              letterSpacing: "-0.025em",
              lineHeight: "1.1",
            }}
          >
            Selected{" "}
            <em className="not-italic text-primary">work.</em>
          </h2>
          <Link
            href="/portfolio"
            className="reveal text-[12px] font-medium tracking-[0.1em] uppercase text-primary opacity-65 hover:opacity-100 transition-opacity whitespace-nowrap mb-2"
          >
            View all projects →
          </Link>
        </div>

        {/* Grid */}
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "1.4fr 1fr" }}
        >
          {cards.map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              className={`reveal-scale${i > 0 ? ` reveal-delay-${i + 1}` : ""} block overflow-hidden cursor-pointer no-underline text-inherit group`}
              style={{ background: "#000" }}
            >
              <div className="overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full block transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-85"
                  style={{ aspectRatio: "16/10", objectFit: "cover", opacity: 0.7 }}
                />
              </div>
              <div style={{ padding: "24px 0 8px" }}>
                <div
                  className="text-[10px] font-medium tracking-[0.16em] uppercase mb-2"
                  style={{ color: "rgba(57,255,20,0.5)" }}
                >
                  {card.tag}
                </div>
                <div
                  className="text-[20px] font-semibold"
                  style={{ letterSpacing: "-0.015em" }}
                >
                  {card.title}
                </div>
                <div
                  className="mt-1.5 text-[13px] font-light"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {card.sub}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
