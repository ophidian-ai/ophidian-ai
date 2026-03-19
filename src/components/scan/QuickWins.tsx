import type { Finding } from '@/lib/scan/types';

interface QuickWinsProps {
  findings: Finding[];
}

const quickWinSuggestions: Record<string, string> = {
  speed_lcp_slow: 'Compress images and enable lazy loading to cut load time in half.',
  speed_no_cache: 'Add Cache-Control headers to static assets for instant repeat visits.',
  speed_render_blocking: 'Defer non-critical JS and inline critical CSS to unblock rendering.',
  seo_missing_title: 'Add a descriptive title tag targeting your primary keyword.',
  seo_missing_meta: 'Write a compelling meta description to improve click-through from search.',
  seo_no_h1: 'Add a single H1 tag with your main keyword on every page.',
  mobile_not_responsive: 'Add a viewport meta tag and use fluid layouts for mobile users.',
  mobile_touch_targets: 'Increase button sizes to at least 44x44px for easier tapping.',
  trust_no_https: 'Install an SSL certificate — most hosts offer this free via Let\'s Encrypt.',
  trust_no_reviews: 'Embed Google reviews or add a testimonials section to build credibility.',
  trust_no_gbp: 'Claim your Google Business Profile to appear in local search results.',
};

function getSuggestion(finding: Finding): string {
  return (
    quickWinSuggestions[finding.id] ??
    `Address this ${finding.severity} issue to recover $${finding.revenue_impact.toLocaleString()}/mo.`
  );
}

export function QuickWins({ findings }: QuickWinsProps) {
  const top = findings.slice(0, 3);

  if (top.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
        <h2 className="text-xl font-bold text-[#0DB1B2] mb-2">Quick Wins</h2>
        <p className="text-slate-400 text-sm">No quick wins identified for this site.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6">
      <h2 className="text-xl font-bold text-[#0DB1B2] mb-1">Quick Wins</h2>
      <p className="text-slate-500 text-sm mb-5">
        Low-effort fixes with the highest return. Start here.
      </p>

      <ol className="space-y-4">
        {top.map((finding, index) => (
          <li key={finding.id} className="flex gap-4">
            {/* Number */}
            <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0DB1B2]/20 text-[#0DB1B2] text-sm font-bold">
              {index + 1}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[#F1F5F9] leading-snug">
                  {finding.title}
                </p>
                <span className="shrink-0 text-sm font-bold text-[#39FF14] whitespace-nowrap">
                  +${finding.revenue_impact.toLocaleString()}/mo
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{getSuggestion(finding)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
