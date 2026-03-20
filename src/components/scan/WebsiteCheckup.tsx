'use client';

import { useState } from 'react';
import { ScanForm } from './ScanForm';
import { ScanProgress } from './ScanProgress';
import { ScoreReveal } from './ScoreReveal';
import { EmailGate } from './EmailGate';
import type { ScanResult } from '@/lib/scan/types';

type ScanState = 'idle' | 'scanning' | 'score_revealed' | 'email_captured';

export function WebsiteCheckup() {
  const [state, setState] = useState<ScanState>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string>('');

  function handleScanStart() {
    setScanError('');
    setState('scanning');
  }

  function handleScanComplete(scanResult: ScanResult) {
    setResult(scanResult);
    setState('score_revealed');
  }

  function handleScanError(error: string) {
    setScanError(error);
    setState('idle');
  }

  function handleContinueToEmail() {
    setState('email_captured');
  }

  return (
    <div className="w-full max-w-150 mx-auto px-4 py-12 sm:py-16">
      {/* Logo / wordmark */}
      <div className="mb-10 text-center">
        <a href="/" className="inline-block">
          <span className="text-sm font-semibold tracking-widest uppercase text-foreground-dim">
            Ophidian<span className="text-primary">AI</span>
          </span>
        </a>
      </div>

      {/* State: idle */}
      {state === 'idle' && (
        <>
          <ScanForm
            onScanStart={handleScanStart}
            onScanComplete={handleScanComplete}
            onScanError={handleScanError}
          />
          {scanError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
              <p className="text-sm text-red-400">{scanError}</p>
            </div>
          )}
        </>
      )}

      {/* State: scanning */}
      {state === 'scanning' && <ScanProgress />}

      {/* State: score_revealed */}
      {state === 'score_revealed' && result && (
        <ScoreReveal result={result} onContinue={handleContinueToEmail} />
      )}

      {/* State: email_captured */}
      {state === 'email_captured' && result && (
        <EmailGate result={result} />
      )}
    </div>
  );
}
