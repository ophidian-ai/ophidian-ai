import Link from 'next/link';

export function CTASection() {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Want us to fix these for you?
      </h2>
      <p className="text-foreground-muted mb-6 max-w-md mx-auto text-sm leading-relaxed">
        Our team can address every issue in this report — from quick wins to deep technical fixes.
        Most clients see results within 30 days.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-background font-semibold text-sm hover:bg-primary-light transition-colors"
        >
          Book a Free 15-Minute Call
        </Link>
      </div>

      <p className="mt-4 text-sm text-foreground-dim">
        Or email us at{' '}
        <a
          href="mailto:eric@ophidianai.com"
          className="text-primary hover:underline"
        >
          eric@ophidianai.com
        </a>
      </p>
    </div>
  );
}
