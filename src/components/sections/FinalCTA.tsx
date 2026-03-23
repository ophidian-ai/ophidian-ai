import { GlassButton } from "@/components/ui/glass-button";

export function FinalCTA() {
  return (
    <section className="py-60 px-8 text-center relative">
      <div className="relative z-10 space-y-16">
        <span
          className="text-[10px] uppercase tracking-[0.6em] block"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
        >
          Initiate Contact
        </span>
        <h2
          className="font-display italic"
          style={{ color: "var(--color-on-surface)", fontSize: "clamp(3.75rem, 8vw, 8rem)" }}
        >
          Ready to Evolve?
        </h2>
        <div className="flex justify-center">
          <GlassButton size="lg" href="#contact">
            Book a Consultation
          </GlassButton>
        </div>
      </div>
    </section>
  );
}
