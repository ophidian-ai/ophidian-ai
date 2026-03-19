'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ScanResult } from '@/lib/scan/types';

interface EmailGateProps {
  result: ScanResult;
}

export function EmailGate({ result }: EmailGateProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/scan/${result.scan_id}/capture-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Failed to save email');
      }

      router.push(`/report/${result.scan_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
        Your report is ready.
      </h2>
      <p className="text-[#94A3B8] mb-8">
        We&apos;ll send a PDF copy to your inbox too.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="gate-email" className="sr-only">
            Email address
          </label>
          <input
            id="gate-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            placeholder="you@yourbusiness.com"
            disabled={isSubmitting}
            autoComplete="email"
            className={[
              'w-full px-5 py-4 rounded-xl text-base',
              'bg-[#0F1B28] text-[#F1F5F9] placeholder-[#64748B]',
              'border transition-all duration-200',
              error
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/40 outline-none'
                : 'border-[rgba(255,255,255,0.12)] focus:border-[#0DB1B2] focus:ring-2 focus:ring-[#0DB1B2]/30 outline-none',
            ].join(' ')}
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="w-full py-4 px-6 rounded-xl text-base font-semibold bg-[#0DB1B2] text-white hover:bg-[#0CA0A1] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0DB1B2]/50"
        >
          {isSubmitting ? 'Opening your report...' : 'Get My Full Report'}
        </button>
      </form>

      {/* Trust notes */}
      <div className="mt-6 space-y-1 text-center">
        <p className="text-sm text-[#64748B]">No spam. Just your report.</p>
        <p className="text-sm text-[#64748B]">We&apos;ll send a PDF copy to your inbox too.</p>
      </div>
    </div>
  );
}
