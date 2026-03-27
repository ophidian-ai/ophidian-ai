"use client";

/**
 * Visual mockup of the AI Content Engine generating social media posts.
 * Used on the homepage ProductShowcase and Content Generation service page.
 */
export function ContentEngineMockup() {
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
          background: "linear-gradient(135deg, rgba(196,162,101,0.2) 0%, rgba(196,162,101,0.08) 100%)",
          borderBottom: "1px solid var(--color-outline-variant)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(196,162,101,0.2)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--color-on-surface)" }}>
            Content Engine
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
          AI Generated
        </span>
      </div>

      {/* Content Preview */}
      <div className="p-5 space-y-4">
        {/* Brand Voice indicator */}
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] uppercase tracking-widest"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}
          >
            Brand Voice:
          </span>
          <span className="text-[11px]" style={{ color: "var(--color-on-surface-variant)" }}>
            Friendly &bull; Local &bull; Inviting
          </span>
        </div>

        {/* Generated post card */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            background: "var(--color-surface-container-high)",
            border: "1px solid var(--color-outline-variant)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ background: "var(--color-primary)", opacity: 0.6 }} />
            <span className="text-[11px] font-medium" style={{ color: "var(--color-on-surface)" }}>
              Bloomin&apos; Acres Market
            </span>
            <span className="text-[10px] ml-auto" style={{ color: "var(--color-on-surface-variant)" }}>
              Instagram
            </span>
          </div>
          <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--color-on-surface)" }}>
            Fresh sourdough just came out of the oven! Stop by this Saturday for our
            weekly farmers market specials. Homemade bread, seasonal produce, and
            locally sourced honey.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {["#ShopLocal", "#FarmFresh", "#ColumbusIN", "#Sourdough"].map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(170,208,173,0.1)", color: "var(--color-primary)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Schedule row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-[11px]" style={{ color: "var(--color-on-surface-variant)" }}>
              Scheduled: Sat 9:00 AM
            </span>
          </div>
          <div className="flex gap-1.5">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: "rgba(170,208,173,0.1)" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-primary)">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
              </svg>
            </div>
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: "rgba(196,162,101,0.1)" }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-secondary)">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats preview */}
        <div
          className="grid grid-cols-3 gap-2 pt-2"
          style={{ borderTop: "1px solid var(--color-outline-variant)" }}
        >
          {[
            { label: "Posts / Mo", value: "12" },
            { label: "Engagement", value: "+34%" },
            { label: "Reach", value: "2.4K" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-base font-semibold" style={{ color: "var(--color-secondary)" }}>
                {stat.value}
              </div>
              <div
                className="text-[9px] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-on-surface-variant)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
