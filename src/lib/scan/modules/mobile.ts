/**
 * Mobile Module
 *
 * Analyzes a site's mobile-friendliness using HTML inspection and
 * PageSpeed Insights audit data shared from the speed module.
 * PSI data is passed in to avoid a duplicate API call.
 */

import { ModuleResult, Finding, scoreToGrade } from '../types';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface PsiAudit {
  score?: number | null;
}

interface PsiData {
  lighthouseResult?: {
    audits?: {
      viewport?: PsiAudit;
      'font-size'?: PsiAudit;
      'tap-targets'?: PsiAudit;
    };
  };
}

// ---------------------------------------------------------------------------
// HTML checks
// ---------------------------------------------------------------------------

function hasViewportMeta(html: string): boolean {
  // Look for <meta name="viewport" ... width=device-width ...>
  const metaPattern = /<meta[^>]+name=["']viewport["'][^>]*>/gi;
  const matches = html.match(metaPattern);
  if (!matches) return false;
  return matches.some((tag) => /width=device-width/i.test(tag));
}

// ---------------------------------------------------------------------------
// Finding generators
// ---------------------------------------------------------------------------

function findingMissingViewport(): Finding {
  return {
    id: 'mobile-no-viewport',
    module: 'mobile',
    severity: 'critical',
    title: 'Missing Mobile Viewport',
    description:
      'This site is missing the viewport meta tag required for mobile rendering. ' +
      'Without it, mobile browsers display a shrunken desktop layout -- text is ' +
      'illegible and buttons are impossible to tap, driving away the majority of ' +
      'visitors who browse on phones.',
    revenue_impact: 0,
    benchmark: 'All modern sites include <meta name="viewport" content="width=device-width, initial-scale=1">.',
    quick_win: true,
  };
}

function findingSmallFontSize(): Finding {
  return {
    id: 'mobile-small-font-size',
    module: 'mobile',
    severity: 'moderate',
    title: 'Text Too Small on Mobile',
    description:
      'Some text on this site is too small to read comfortably on a mobile screen. ' +
      'Visitors are forced to pinch-zoom to read content, which degrades the experience ' +
      'and makes it less likely they will complete a call, form submission, or purchase.',
    revenue_impact: 0,
    benchmark: 'Google recommends a minimum font size of 12px for mobile readability.',
    quick_win: false,
  };
}

function findingTapTargets(): Finding {
  return {
    id: 'mobile-tap-targets-small',
    module: 'mobile',
    severity: 'moderate',
    title: 'Tap Targets Too Small',
    description:
      'Buttons and links on this site are too small or too close together for reliable ' +
      'tapping on a touchscreen. Visitors frequently miss or mis-tap interactive elements, ' +
      'causing frustration and reducing the chance they take action.',
    revenue_impact: 0,
    benchmark: 'Google recommends tap targets of at least 48x48px with adequate spacing.',
    quick_win: false,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function analyzeMobile(
  _url: string,
  html: string,
  psiData?: PsiData,
): Promise<ModuleResult> {
  try {
    const findings: Finding[] = [];

    const viewportPresent = hasViewportMeta(html);
    if (!viewportPresent) {
      findings.push(findingMissingViewport());
    }

    if (!psiData) {
      // No PSI data -- score based solely on the HTML viewport check
      const score = viewportPresent ? 70 : 20;
      return {
        score,
        grade: scoreToGrade(score),
        status: 'ok',
        error: null,
        findings,
      };
    }

    // PSI data available -- extract audit scores
    const audits = psiData.lighthouseResult?.audits ?? {};

    const viewportAudit = audits['viewport'];
    const fontSizeAudit = audits['font-size'];
    const tapTargetsAudit = audits['tap-targets'];

    // PSI scores are 0-1; < 1 means failing
    const viewportPass =
      viewportAudit?.score == null ? viewportPresent : viewportAudit.score >= 1;
    const fontSizePass =
      fontSizeAudit?.score == null ? true : fontSizeAudit.score >= 1;
    const tapTargetsPass =
      tapTargetsAudit?.score == null ? true : tapTargetsAudit.score >= 1;

    // Override the HTML-only viewport finding if PSI disagrees
    if (!viewportPass) {
      // Ensure the viewport finding is present (HTML check may have caught it already)
      if (!findings.some((f) => f.id === 'mobile-no-viewport')) {
        findings.push(findingMissingViewport());
      }
    }

    if (!fontSizePass) {
      findings.push(findingSmallFontSize());
    }

    if (!tapTargetsPass) {
      findings.push(findingTapTargets());
    }

    // Weighted score: viewport 40, font-size 30, tap-targets 30
    const score = Math.min(
      100,
      Math.max(
        0,
        (viewportPass ? 40 : 0) +
          (fontSizePass ? 30 : 0) +
          (tapTargetsPass ? 30 : 0),
      ),
    );

    return {
      score,
      grade: scoreToGrade(score),
      status: 'ok',
      error: null,
      findings,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown error';

    return {
      score: null,
      grade: '-',
      status: 'unavailable',
      error: message,
      findings: [],
    };
  }
}
