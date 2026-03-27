'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

const CHECKLIST_ITEMS = [
  // Speed & Performance
  { category: 'Speed & Performance', item: 'Pages load in under 3 seconds on mobile' },
  { category: 'Speed & Performance', item: 'Images are compressed and use modern formats (WebP/AVIF)' },
  { category: 'Speed & Performance', item: 'No render-blocking JavaScript or CSS in the head' },
  { category: 'Speed & Performance', item: 'Hosting provider uses a CDN (Content Delivery Network)' },
  // SEO
  { category: 'SEO Basics', item: 'Every page has a unique title tag (under 60 characters)' },
  { category: 'SEO Basics', item: 'Every page has a meta description (under 160 characters)' },
  { category: 'SEO Basics', item: 'Site has a sitemap.xml submitted to Google Search Console' },
  { category: 'SEO Basics', item: 'Google Business Profile is claimed and up to date' },
  { category: 'SEO Basics', item: 'NAP (Name, Address, Phone) is consistent across all listings' },
  // Mobile
  { category: 'Mobile Experience', item: 'Site is fully responsive (no horizontal scrolling on phones)' },
  { category: 'Mobile Experience', item: 'Buttons and links have at least 48px tap targets' },
  { category: 'Mobile Experience', item: 'Text is readable without pinching or zooming' },
  { category: 'Mobile Experience', item: 'Phone number is tap-to-call on mobile' },
  // Trust & Security
  { category: 'Trust & Security', item: 'SSL certificate installed (URL shows https://)' },
  { category: 'Trust & Security', item: 'Business address and phone number are visible on every page' },
  { category: 'Trust & Security', item: 'At least one real client testimonial or Google review is displayed' },
  { category: 'Trust & Security', item: 'Privacy policy page exists and is linked in the footer' },
  // Conversion
  { category: 'Conversion & CTA', item: 'Clear call-to-action above the fold on every page' },
  { category: 'Conversion & CTA', item: 'Contact form works and sends a confirmation email' },
  { category: 'Conversion & CTA', item: 'Google Analytics or similar tracking is installed' },
];

const categories = [...new Set(CHECKLIST_ITEMS.map((i) => i.category))];

export function ChecklistContent() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'locked' | 'loading' | 'unlocked' | 'error'>('locked');
  const [errorMessage, setErrorMessage] = useState('');
  const [checked, setChecked] = useState<Set<number>>(new Set());

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: 'website-checklist' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Something went wrong.');
      }

      setStatus('unlocked');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  function toggleCheck(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const score = checked.size;
  const total = CHECKLIST_ITEMS.length;
  const pct = Math.round((score / total) * 100);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <a href="/" className="inline-block mb-8">
            <span className="text-sm font-semibold tracking-widest uppercase text-foreground-dim">
              Ophidian<span className="text-primary">AI</span>
            </span>
          </a>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            The Small Business Website Checklist
          </h1>
          <p className="text-foreground-muted max-w-xl mx-auto">
            20 things every small business website needs to attract customers and rank on Google.
            Check off what you have — and see what you&apos;re missing.
          </p>
        </div>

        {/* Email gate */}
        {status === 'locked' || status === 'loading' || status === 'error' ? (
          <div className="rounded-xl border border-surface-border bg-white/3 p-8 text-center mb-10">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Enter your email to unlock the checklist
            </h2>
            <p className="text-foreground-muted text-sm mb-6">
              We&apos;ll also send you a copy you can reference later. No spam, ever.
            </p>

            <form onSubmit={handleUnlock} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="you@yourbusiness.com"
                disabled={status === 'loading'}
                className="flex-1 px-5 py-3 rounded-xl text-base bg-background-alt text-foreground placeholder-foreground-dim border border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="px-6 py-3 rounded-xl text-base font-semibold bg-primary text-background hover:bg-primary-light active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Unlocking...' : 'Unlock Checklist'}
              </button>
            </form>

            {errorMessage && (
              <p className="mt-3 text-sm text-[var(--color-error-light)]">{errorMessage}</p>
            )}
          </div>
        ) : (
          <>
            {/* Score bar */}
            <div className="rounded-xl border border-surface-border bg-white/3 p-6 mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground-muted">Your score</span>
                <span className="text-sm font-bold text-primary">
                  {score}/{total} ({pct}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-background-alt overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-foreground-dim">
                {pct >= 80
                  ? 'Great job! Your website is in good shape.'
                  : pct >= 50
                    ? 'You have a solid foundation but there\'s room to improve.'
                    : 'Your website needs attention. The items below will help you prioritize.'}
              </p>
            </div>

            {/* Checklist */}
            {categories.map((cat) => (
              <section key={cat} className="mb-8">
                <h2 className="text-lg font-bold text-primary mb-3">{cat}</h2>
                <div className="space-y-2">
                  {CHECKLIST_ITEMS.map((item, i) => {
                    if (item.category !== cat) return null;
                    const isChecked = checked.has(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleCheck(i)}
                        className={[
                          'w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200',
                          isChecked
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-surface-border bg-white/3 hover:border-primary/20',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                            isChecked
                              ? 'border-primary bg-primary'
                              : 'border-foreground-dim',
                          ].join(' ')}
                        >
                          {isChecked && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2.5 6L5 8.5L9.5 3.5"
                                stroke="var(--color-background)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span
                          className={[
                            'text-sm leading-relaxed transition-colors duration-200',
                            isChecked ? 'text-foreground-muted line-through' : 'text-foreground',
                          ].join(' ')}
                        >
                          {item.item}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* CTA */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center mt-10">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {pct >= 80 ? 'Looking good! Want to go further?' : 'Need help checking these off?'}
              </h2>
              <p className="text-foreground-muted mb-6 max-w-md mx-auto text-sm leading-relaxed">
                {pct >= 80
                  ? 'Our free website audit digs deeper — speed scores, SEO issues, and estimated revenue impact.'
                  : 'Run a free website audit to see exactly what to fix first — prioritized by revenue impact.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/tools/website-checkup"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-background font-semibold text-sm hover:bg-primary-light transition-colors"
                >
                  Run Free Website Audit
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors"
                >
                  Book a Free Call
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
