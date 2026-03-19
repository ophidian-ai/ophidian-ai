'use client';

import { useState, useRef } from 'react';
import type { ScanResult } from '@/lib/scan/types';

interface ScanFormProps {
  onScanStart: () => void;
  onScanComplete: (result: ScanResult) => void;
  onScanError: (error: string) => void;
}

export function ScanForm({ onScanStart, onScanComplete, onScanError }: ScanFormProps) {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const honeypotRef = useRef<HTMLInputElement>(null);

  function normalizeUrl(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Honeypot check — bots fill this field, humans don't
    if (honeypotRef.current?.value) {
      return;
    }

    const normalized = normalizeUrl(url);
    if (!normalized) {
      setValidationError('Please enter a website URL.');
      return;
    }

    try {
      new URL(normalized);
    } catch {
      setValidationError('Please enter a valid URL (e.g. yourbusiness.com).');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);
    onScanStart();

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || `Scan failed (${res.status})`);
      }

      const result = (await res.json()) as ScanResult;
      onScanComplete(result);
    } catch (err) {
      onScanError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl font-bold text-[#F1F5F9] mb-4 leading-tight tracking-tight">
        Is Your Website Costing You Customers?
      </h1>

      {/* Subhead */}
      <p className="text-lg text-[#94A3B8] mb-10 leading-relaxed">
        Enter your URL. Get a free report showing exactly where you&apos;re losing revenue — and how to fix it.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Honeypot — hidden from real users */}
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          className="absolute left-[-9999px] opacity-0 pointer-events-none"
        />

        {/* URL input */}
        <div>
          <label htmlFor="scan-url" className="sr-only">
            Website URL
          </label>
          <input
            id="scan-url"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="yourbusiness.com"
            disabled={isSubmitting}
            autoComplete="url"
            spellCheck={false}
            className={[
              'w-full px-5 py-4 rounded-xl text-base',
              'bg-[#0F1B28] text-[#F1F5F9] placeholder-[#64748B]',
              'border transition-all duration-200',
              validationError
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/40 outline-none'
                : 'border-[rgba(255,255,255,0.12)] focus:border-[#0DB1B2] focus:ring-2 focus:ring-[#0DB1B2]/30 outline-none',
            ].join(' ')}
          />
          {validationError && (
            <p className="mt-2 text-sm text-red-400">{validationError}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !url.trim()}
          className={[
            'w-full py-4 px-6 rounded-xl text-base font-semibold',
            'bg-[#0DB1B2] text-white',
            'transition-all duration-200',
            'hover:bg-[#0CA0A1] active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
            'focus:outline-none focus:ring-2 focus:ring-[#0DB1B2]/50',
          ].join(' ')}
        >
          {isSubmitting ? 'Starting scan...' : 'Scan My Site'}
        </button>
      </form>

      {/* Social proof */}
      <p className="mt-6 text-sm text-[#64748B] text-center">
        Trusted analysis built on industry-standard tools
      </p>
    </div>
  );
}
