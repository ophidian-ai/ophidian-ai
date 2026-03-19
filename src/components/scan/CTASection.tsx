import Link from 'next/link';

export function CTASection() {
  return (
    <div className="rounded-xl border border-[#0DB1B2]/30 bg-[#0DB1B2]/[0.05] p-8 text-center">
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
        Want us to fix these for you?
      </h2>
      <p className="text-slate-400 mb-6 max-w-md mx-auto text-sm leading-relaxed">
        Our team can address every issue in this report — from quick wins to deep technical fixes.
        Most clients see results within 30 days.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/contact"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#0DB1B2] text-white font-semibold text-sm hover:bg-[#0DB1B2]/90 transition-colors"
        >
          Book a Free 15-Minute Call
        </Link>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Or email us at{' '}
        <a
          href="mailto:eric@ophidianai.com"
          className="text-[#0DB1B2] hover:underline"
        >
          eric@ophidianai.com
        </a>
      </p>
    </div>
  );
}
