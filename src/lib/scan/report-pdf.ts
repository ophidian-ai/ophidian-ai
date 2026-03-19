/**
 * Scan Report PDF Generator
 *
 * Converts a ScanResult into a branded A4 PDF using Puppeteer to render
 * the HTML template (src/lib/scan/report-template.html).
 *
 * NOTE: Puppeteer is a devDependency. In Vercel production (serverless), it
 * is not bundled and this function will throw. To run PDF generation in
 * production you must either:
 *   1. Add @sparticuz/chromium + puppeteer-core and branch on environment, or
 *   2. Move PDF generation to a long-running server/worker outside of Vercel
 *      serverless functions.
 * For now, this implementation works locally and in environments where
 * Puppeteer is installed (CI, self-hosted, Docker).
 */

import fs from 'fs';
import path from 'path';
import type { ScanResult, Finding, ModuleName } from './types';

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatDollars(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

function scoreColor(score: number | null): string {
  if (score === null) return '#475569';
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function scoreBorderColor(score: number | null): string {
  if (score === null) return '#1E3A5F';
  if (score >= 80) return '#166534';
  if (score >= 60) return '#854d0e';
  if (score >= 40) return '#9a3412';
  return '#7f1d1d';
}

function gradeColor(grade: string): string {
  if (grade === 'A') return '#22c55e';
  if (grade === 'B') return '#84cc16';
  if (grade === 'C') return '#eab308';
  if (grade === 'D') return '#f97316';
  return '#ef4444';
}

function moduleGradeChipStyles(score: number | null): { bg: string; fg: string } {
  const color = scoreColor(score);
  const bg = scoreBorderColor(score);
  return { bg, fg: color };
}

function severityClass(severity: string): string {
  if (severity === 'critical') return 'severity-critical';
  if (severity === 'moderate') return 'severity-moderate';
  return 'severity-minor';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const MODULE_LABELS: Record<ModuleName, string> = {
  speed: 'Page Speed',
  seo: 'SEO',
  mobile: 'Mobile',
  trust: 'Trust & Credibility',
};

// ---------------------------------------------------------------------------
// HTML fragment builders
// ---------------------------------------------------------------------------

function buildModuleCards(result: ScanResult): string {
  const modules: ModuleName[] = ['speed', 'seo', 'mobile', 'trust'];

  return modules
    .map((name) => {
      const mod = result.modules[name];
      const score = mod.score;
      const grade = mod.grade;
      const color = scoreColor(score);
      const chips = moduleGradeChipStyles(score);
      const scoreDisplay = score !== null ? String(score) : '—';
      const topFindings = mod.findings.slice(0, 3);

      const findingItems = topFindings.length
        ? topFindings
            .map((f) => `<li>${f.title}</li>`)
            .join('\n')
        : '<li>No issues found</li>';

      return `
        <div class="module-card">
          <div class="module-card-header">
            <div class="module-name">${MODULE_LABELS[name]}</div>
            <div>
              <span style="font-size:22px;font-weight:900;color:${color};">${scoreDisplay}</span>
              <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${chips.bg};color:${chips.fg};margin-left:6px;">${grade}</span>
            </div>
          </div>
          <ul class="module-findings-list">
            ${findingItems}
          </ul>
        </div>`;
    })
    .join('\n');
}

function buildFindingRows(findings: Finding[]): string {
  if (!findings.length) {
    return `<tr class="empty-row"><td colspan="4">No findings recorded.</td></tr>`;
  }

  const sorted = [...findings].sort((a, b) => b.revenue_impact - a.revenue_impact);

  return sorted
    .map((f) => {
      return `
        <tr>
          <td>
            <div style="font-weight:600;color:#F1F5F9;font-size:12px;">${f.title}</div>
            <div class="finding-description">${f.description}</div>
          </td>
          <td><span class="module-tag">${f.module}</span></td>
          <td><span class="severity-badge ${severityClass(f.severity)}">${f.severity}</span></td>
          <td style="text-align:right;" class="revenue-amount">${formatDollars(f.revenue_impact)}</td>
        </tr>`;
    })
    .join('\n');
}

function buildQuickWinItems(quickWins: Finding[]): string {
  if (!quickWins.length) {
    return `<p style="color:#475569;font-style:italic;font-size:12px;">No quick wins identified.</p>`;
  }

  return quickWins
    .slice(0, 3)
    .map((f, i) => {
      return `
        <div class="quick-win-item">
          <div class="quick-win-number">${i + 1}</div>
          <div class="quick-win-content">
            <div class="quick-win-title">${f.title}</div>
            <div class="quick-win-desc">${f.description}</div>
          </div>
          <div class="quick-win-impact">${formatDollars(f.revenue_impact)}/mo</div>
        </div>`;
    })
    .join('\n');
}

// ---------------------------------------------------------------------------
// Token replacement
// ---------------------------------------------------------------------------

function applyTokens(template: string, tokens: Record<string, string>): string {
  let html = template;
  for (const [key, value] of Object.entries(tokens)) {
    // Replace all occurrences of {{key}}
    html = html.split(`{{${key}}}`).join(value);
  }
  return html;
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

export async function generateReportPDF(result: ScanResult): Promise<Buffer> {
  // 1. Read template
  const templatePath = path.join(process.cwd(), 'src/lib/scan/report-template.html');
  const template = fs.readFileSync(templatePath, 'utf-8');

  // 2. Compute derived display values
  const score = result.overall_score;
  const grade = result.overall_grade;
  const circleColor = scoreColor(score);
  const circleBorder = scoreBorderColor(score);
  const gColor = gradeColor(grade);

  // 3. Build token map (simple scalars)
  const tokens: Record<string, string> = {
    url: result.url,
    reportDate: formatDate(result.scanned_at),
    score: score !== null ? String(score) : '—',
    grade,
    monthlyLeakFormatted: formatDollars(result.estimated_monthly_leak),
    scoreCircleBackground: circleBorder,
    scoreCircleBorder: circleColor,
    scoreColor: circleColor,
    gradeColor: gColor,
    // module card placeholder colors -- these appear in the template CSS as
    // example defaults but get overridden per-card in the HTML strings
    moduleScoreColor: circleColor,
    moduleGradeBackground: circleBorder,
    moduleGradeColor: circleColor,
    // Block placeholders
    moduleCards: buildModuleCards(result),
    findingRows: buildFindingRows(result.findings),
    quickWinItems: buildQuickWinItems(result.top_quick_wins),
  };

  // 4. Apply tokens
  const html = applyTokens(template, tokens);

  // 5. Launch Puppeteer and render PDF
  const puppeteer = await import('puppeteer-core');
  const chromium = (await import('@sparticuz/chromium')).default;

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  let pdfBuffer: Buffer;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const rawPdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
    pdfBuffer = Buffer.from(rawPdf);
  } finally {
    await browser.close();
  }

  return pdfBuffer;
}
