'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const DISMISS_KEY = 'ophidian_scroll_cta_dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SCROLL_THRESHOLD = 0.5; // 50% of page

/** Pages where the CTA should not appear (they already have their own CTAs). */
const SUPPRESSED_PATHS = [
  '/tools/website-checkup',
  '/resources/website-checklist',
  '/report/',
  '/contact',
];

export function ScrollCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true); // start hidden

  // Check localStorage on mount
  useEffect(() => {
    // Suppress on certain pages
    const path = window.location.pathname;
    if (SUPPRESSED_PATHS.some((p) => path.startsWith(p))) return;

    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw) {
        const dismissedAt = Number(raw);
        if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return;
      }
    } catch { /* localStorage unavailable */ }

    setDismissed(false);
  }, []);

  // Track scroll position
  const handleScroll = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    const scrollPct = window.scrollY / scrollHeight;
    setVisible(scrollPct >= SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    if (dismissed) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed, handleScroll]);

  function handleDismiss() {
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* ignore */ }
  }

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 pointer-events-none animate-slide-up"
    >
      <div className="max-w-2xl mx-auto px-4 pb-4 pointer-events-auto">
        <div className="relative rounded-xl border border-primary/30 bg-[var(--color-surface-container)] backdrop-blur-sm shadow-2xl p-5">
          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-foreground-dim hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1">
                Is your website losing you customers?
              </p>
              <p className="text-xs text-foreground-muted">
                Get a free website audit — see your speed, SEO, and mobile scores in 30 seconds.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href="/tools/website-checkup"
                onClick={handleDismiss}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-background text-sm font-semibold hover:bg-primary-light transition-colors"
              >
                Free Audit
              </Link>
              <Link
                href="/resources/website-checklist"
                onClick={handleDismiss}
                className="inline-flex items-center px-4 py-2 rounded-lg border border-primary/40 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
              >
                Checklist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
