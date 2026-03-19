/**
 * SEO Module
 *
 * Analyzes on-page SEO signals from pre-fetched HTML and checks for
 * sitemap/robots.txt via HEAD requests. Returns a ModuleResult with
 * findings and a score.
 */

import { ModuleResult, Finding, scoreToGrade } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return null;
  return stripTags(match[1]).trim();
}

function extractMetaDescription(html: string): string | null {
  // Match <meta name="description" content="..."> in any attribute order
  const match = html.match(
    /<meta[^>]+name\s*=\s*["']description["'][^>]+content\s*=\s*["']([^"']*)["'][^>]*>/i
  ) ?? html.match(
    /<meta[^>]+content\s*=\s*["']([^"']*)["'][^>]+name\s*=\s*["']description["'][^>]*>/i
  );
  if (!match) return null;
  return match[1].trim();
}

function countH1s(html: string): number {
  const matches = html.match(/<h1[\s>]/gi);
  return matches ? matches.length : 0;
}

interface ImgAltStats {
  total: number;
  missingAlt: number;
}

function analyzeImgAlt(html: string): ImgAltStats {
  const imgTags = html.match(/<img[^>]*>/gi) ?? [];
  const total = imgTags.length;
  let missingAlt = 0;

  for (const tag of imgTags) {
    // Missing alt entirely, or alt="" (empty)
    const hasAlt = /\balt\s*=\s*["'][^"']*["']/i.test(tag);
    if (!hasAlt) {
      missingAlt++;
    } else {
      // alt="" counts as missing
      const emptyAlt = /\balt\s*=\s*["']\s*["']/i.test(tag);
      if (emptyAlt) missingAlt++;
    }
  }

  return { total, missingAlt };
}

function hasCanonical(html: string): boolean {
  return /<link[^>]+rel\s*=\s*["']canonical["'][^>]*>/i.test(html)
    || /<link[^>]+rel\s*=\s*canonical[^>]*>/i.test(html);
}

async function headRequest(url: string, timeoutMs: number): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    return res.status;
  } catch {
    return null; // timeout or network error
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function analyzeSEO(url: string, html: string): Promise<ModuleResult> {
  const findings: Finding[] = [];

  // 1. Title tag
  const title = extractTitle(html);
  if (title === null) {
    findings.push({
      id: 'seo-missing-title',
      module: 'seo',
      severity: 'critical',
      title: 'Missing Page Title',
      description: 'Search engines use the page title to understand what your page is about. Without one, your site is nearly invisible in search results.',
      revenue_impact: 0,
      benchmark: 'Best practice: 50-60 character title tag that includes your primary keyword.',
      quick_win: true,
    });
  } else if (title.length < 30 || title.length > 60) {
    findings.push({
      id: 'seo-title-length',
      module: 'seo',
      severity: 'minor',
      title: 'Page Title Length',
      description: `Your page title is ${title.length} characters. Titles that are too short or too long get truncated or ignored in search results, reducing click-through rates.`,
      revenue_impact: 0,
      benchmark: 'Best practice: 50-60 character title tag.',
      quick_win: false,
    });
  }

  // 2. Meta description
  const metaDesc = extractMetaDescription(html);
  if (metaDesc === null) {
    findings.push({
      id: 'seo-missing-meta-description',
      module: 'seo',
      severity: 'critical',
      title: 'Missing Meta Description',
      description: 'Without a meta description, Google writes its own preview snippet, which is usually low-quality and reduces clicks from search results.',
      revenue_impact: 0,
      benchmark: 'Best practice: 120-160 character meta description summarizing the page.',
      quick_win: true,
    });
  } else if (metaDesc.length < 120 || metaDesc.length > 160) {
    findings.push({
      id: 'seo-meta-description-length',
      module: 'seo',
      severity: 'minor',
      title: 'Meta Description Length',
      description: `Your meta description is ${metaDesc.length} characters. Descriptions outside the 120-160 character range are truncated in search results, hurting click-through rates.`,
      revenue_impact: 0,
      benchmark: 'Best practice: 120-160 character meta description.',
      quick_win: false,
    });
  }

  // 3. H1 tag
  const h1Count = countH1s(html);
  if (h1Count === 0) {
    findings.push({
      id: 'seo-missing-h1',
      module: 'seo',
      severity: 'moderate',
      title: 'Missing H1 Heading',
      description: 'An H1 heading tells search engines the primary topic of your page. Missing it weakens your keyword relevance and ranking potential.',
      revenue_impact: 0,
      benchmark: 'Best practice: one H1 heading per page containing your primary keyword.',
      quick_win: false,
    });
  } else if (h1Count > 1) {
    findings.push({
      id: 'seo-multiple-h1',
      module: 'seo',
      severity: 'moderate',
      title: 'Multiple H1 Headings',
      description: `Your page has ${h1Count} H1 headings. Multiple H1s dilute keyword signals and confuse search engines about which topic is primary.`,
      revenue_impact: 0,
      benchmark: 'Best practice: exactly one H1 heading per page.',
      quick_win: false,
    });
  }

  // 4. Image alt text
  const { total: imgTotal, missingAlt } = analyzeImgAlt(html);
  if (imgTotal > 0) {
    const missingPct = missingAlt / imgTotal;
    if (missingPct > 0.5) {
      findings.push({
        id: 'seo-images-missing-alt',
        module: 'seo',
        severity: 'critical',
        title: 'Images Missing Alt Text',
        description: `${missingAlt} of ${imgTotal} images are missing alt text. Alt text helps search engines index your images and is required for accessibility compliance.`,
        revenue_impact: 0,
        benchmark: 'Best practice: every image should have descriptive alt text.',
        quick_win: true,
      });
    } else if (missingPct > 0.25) {
      findings.push({
        id: 'seo-some-images-missing-alt',
        module: 'seo',
        severity: 'moderate',
        title: 'Some Images Missing Alt Text',
        description: `${missingAlt} of ${imgTotal} images are missing alt text. This reduces image search visibility and may affect accessibility scores.`,
        revenue_impact: 0,
        benchmark: 'Best practice: every image should have descriptive alt text.',
        quick_win: false,
      });
    }
  }

  // 5. Canonical URL
  if (!hasCanonical(html)) {
    findings.push({
      id: 'seo-missing-canonical',
      module: 'seo',
      severity: 'minor',
      title: 'Missing Canonical URL',
      description: 'Without a canonical tag, search engines may index duplicate versions of your page (http vs https, www vs non-www), splitting your ranking authority.',
      revenue_impact: 0,
      benchmark: 'Best practice: include a <link rel="canonical"> on every page.',
      quick_win: false,
    });
  }

  // 6. Sitemap
  let origin: string;
  try {
    origin = new URL(url).origin;
  } catch {
    origin = url;
  }

  const sitemapStatus = await headRequest(`${origin}/sitemap.xml`, 3000);
  if (sitemapStatus === null || sitemapStatus === 404) {
    findings.push({
      id: 'seo-missing-sitemap',
      module: 'seo',
      severity: 'moderate',
      title: 'Missing Sitemap',
      description: 'A sitemap tells search engines which pages to crawl and index. Without one, new or updated pages may take much longer to appear in search results.',
      revenue_impact: 0,
      benchmark: 'Best practice: submit a sitemap.xml to Google Search Console.',
      quick_win: true,
    });
  }

  // 7. Robots.txt
  const robotsStatus = await headRequest(`${origin}/robots.txt`, 3000);
  if (robotsStatus === null || robotsStatus === 404) {
    findings.push({
      id: 'seo-missing-robots',
      module: 'seo',
      severity: 'minor',
      title: 'Missing Robots.txt',
      description: 'A robots.txt file guides search engine crawlers. Without it, crawlers may waste crawl budget on irrelevant pages or get confused about which pages to index.',
      revenue_impact: 0,
      benchmark: 'Best practice: include a robots.txt at the root of your domain.',
      quick_win: false,
    });
  }

  // ---------------------------------------------------------------------------
  // Scoring
  // ---------------------------------------------------------------------------

  const DEDUCTIONS: Record<string, number> = {
    critical: 25,
    moderate: 15,
    minor: 5,
  };

  let score = 100;
  for (const finding of findings) {
    score -= DEDUCTIONS[finding.severity] ?? 0;
  }
  score = Math.max(0, score);

  return {
    score,
    grade: scoreToGrade(score),
    status: 'ok',
    error: null,
    findings,
  };
}
