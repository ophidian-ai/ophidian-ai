import { GlassButton } from "@/components/ui/glass-button";

export function FinalCTA() {
  return (
    <section className="py-60 px-8 text-center relative">
      <div className="relative z-10 space-y-16">
        <span
          className="text-[10px] uppercase tracking-[0.6em] block"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
        >
          Let&apos;s Talk
        </span>
        <h2
          className="font-display italic"
          style={{ color: "var(--color-on-surface)", fontSize: "clamp(3.75rem, 8vw, 8rem)" }}
        >
          Ready to Get Started?
        </h2>
        <p
          className="max-w-lg mx-auto text-lg font-light leading-relaxed"
          style={{ color: "var(--color-on-surface-variant)", opacity: 0.7 }}
        >
          Book a free discovery call. We&apos;ll look at your current setup and show you what&apos;s possible.
        </p>
        <div className="flex justify-center">
          <GlassButton size="lg" href="/contact">
            Book a Free Call
          </GlassButton>
        </div>
      </div>
    </section>
  );
}
