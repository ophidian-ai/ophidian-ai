const testimonials = [
  {
    name: "Sarah Mitchell",
    location: "Columbus, OH",
    role: "Small Business Owner",
    quote:
      "OphidianAI automated our customer follow-ups and scheduling. What used to take our team 3 hours a day now runs itself. We haven't looked back.",
  },
  {
    name: "James Rodriguez",
    location: "Indianapolis, IN",
    role: "Operations Manager",
    quote:
      "The integration they built connects our inventory, orders, and shipping in one pipeline. Errors dropped by 80% in the first month.",
  },
  {
    name: "Emily Chen",
    location: "Chicago, IL",
    role: "Marketing Director",
    quote:
      "We launched with a site that looked like a $20K agency build. The AI-assisted workflow they set up means our campaigns run even when the team is offline.",
  },
  {
    name: "David Park",
    location: "Cincinnati, OH",
    role: "CEO",
    quote:
      "I was skeptical AI could work for a company our size. Eric proved me wrong in the first week. The ROI was immediate and obvious.",
  },
  {
    name: "Lisa Thompson",
    location: "Louisville, KY",
    role: "E-commerce Manager",
    quote:
      "Product descriptions, SEO tags, inventory alerts — all automated. Our team focuses on growth now instead of repetitive data entry.",
  },
];

export function TestimonialsEditorial() {
  return (
    <section className="py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40 mb-16">
          What clients say
        </p>

        {/* Testimonials list */}
        <div className="divide-y divide-white/8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="group grid grid-cols-[3rem_1fr] md:grid-cols-[3rem_14rem_1fr] gap-6 md:gap-12 py-10 items-start"
            >
              {/* Number */}
              <span className="text-xs font-mono text-foreground/30 pt-1 tabular-nums">
                {String(i + 1).padStart(3, "0")}
              </span>

              {/* Name + meta */}
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground/90">{t.name}</p>
                <p className="text-xs text-foreground/40 mt-1">{t.location}</p>
                <p className="text-xs text-foreground/30 mt-0.5">{t.role}</p>
              </div>

              {/* Quote */}
              <div>
                {/* Name on mobile (shown above quote) */}
                <div className="md:hidden mb-3">
                  <p className="text-sm font-medium text-foreground/90">{t.name}</p>
                  <p className="text-xs text-foreground/40">{t.location} · {t.role}</p>
                </div>
                <p className="text-base md:text-lg text-foreground/70 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
