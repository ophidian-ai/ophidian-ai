import { CalendlyEmbed } from '@/components/ui/CalendlyEmbed';

export function CTASection() {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Want us to fix these for you?
        </h2>
        <p className="text-foreground-muted max-w-md mx-auto text-sm leading-relaxed">
          Pick a time below. We&apos;ll review your report before the call so we can tell you
          exactly what we&apos;d fix first — and what it would cost.
        </p>
      </div>

      {/* Calendly inline embed */}
      <CalendlyEmbed />

      {/* Fallback / alternate contact */}
      <div className="mt-6 text-center space-y-1">
        <p className="text-sm text-foreground-dim">
          Prefer email?{' '}
          <a
            href="mailto:eric@ophidianai.com"
            className="text-primary hover:underline"
          >
            eric@ophidianai.com
          </a>
        </p>
        <p className="text-xs text-foreground-dim">
          Most clients see measurable improvements within 30 days.
        </p>
      </div>
    </div>
  );
}
