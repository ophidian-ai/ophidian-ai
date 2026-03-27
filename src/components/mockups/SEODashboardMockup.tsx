"use client";

/**
 * Visual mockup of SEO performance dashboard / Lighthouse scores.
 * Used on the homepage ProductShowcase and SEO Automation service page.
 */
export function SEODashboardMockup() {
  const scores = [
    { label: "Performance", value: 97, color: "var(--color-primary)" },
    { label: "Accessibility", value: 100, color: "var(--color-secondary)" },
    { label: "Best Practices", value: 96, color: "var(--color-primary)" },
    { label: "SEO", value: 100, color: "var(--color-secondary)" },
  ];

  const metrics = [
    { label: "First Contentful Paint", value: "0.8s", status: "good" },
    { label: "Largest Contentful Paint", value: "1.2s", status: "good" },
    { label: "Total Blocking Time", value: "10ms", status: "good" },
    { label: "Cumulative Layout Shift", value: "0.003", status: "good" },
    { label: "Speed Index", value: "1.1s", status: "good" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden w-full max-w-sm mx-auto"
      style={{
        background: "var(--color-surface-container)",
        border: "1px solid var(--color-outline-variant)",
        boxShadow: "var(--shadow-ambient)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{
          background: "linear-gradient(135deg, rgba(170,208,173,0.15) 0%, rgba(122,158,126,0.08) 100%)",
          borderBottom: "1px solid var(--color-outline-variant)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(170,208,173,0.15)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
            Site Performance
          </span>
        </div>
        <span
          className="text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{
            fontFamily: "var(--font-mono)",
            background: "rgba(170,208,173,0.15)",
            color: "var(--color-primary)",
          }}
        >
          Live Audit
        </span>
      </div>

      {/* Lighthouse Scores */}
      <div className="p-5 space-y-5">
        {/* Client site label */}
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
          >
            Auditing:
          </span>
          <span className="text-[11px]" style={{ color: "var(--color-on-surface-variant)" }}>
            bloominacresmarket.com
          </span>
        </div>

        {/* Score circles */}
        <div className="grid grid-cols-4 gap-3">
          {scores.map((score) => (
            <div key={score.label} className="flex flex-col items-center gap-2">
              <div className="relative w-14 h-14">
                {/* Background ring */}
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="var(--color-surface-container-high)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke={score.color}
                    strokeWidth="3"
                    strokeDasharray={`${(score.value / 100) * 150.8} 150.8`}
                    strokeLinecap="round"
                    style={{ opacity: 0.9 }}
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                  style={{ color: score.color }}
                >
                  {score.value}
                </span>
              </div>
              <span
                className="text-[8px] uppercase tracking-wider text-center leading-tight"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-on-surface-variant)" }}
              >
                {score.label}
              </span>
            </div>
          ))}
        </div>

        {/* Core Web Vitals */}
        <div className="space-y-2">
          <span
            className="text-[9px] uppercase tracking-widest block"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
          >
            Core Web Vitals
          </span>
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex items-center justify-between py-1.5"
              style={{ borderBottom: "1px solid var(--color-outline-variant)" }}
            >
              <span className="text-[11px]" style={{ color: "var(--color-on-surface-variant)" }}>
                {metric.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium" style={{ color: "var(--color-primary)" }}>
                  {metric.value}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--color-primary)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
