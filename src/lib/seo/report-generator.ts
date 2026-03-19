import type { SeoConfig, SeoAudit } from "@/lib/supabase/seo-types";
import type { AuditResult } from "@/lib/seo/audit-engine";
import type { RankResult } from "@/lib/seo/rank-tracker";
import { put } from "@vercel/blob";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score <= 2) return "#ef4444";
  if (score === 3) return "#eab308";
  return "#22c55e";
}

function scoreLabel(score: number): string {
  if (score <= 2) return "Poor";
  if (score === 3) return "Fair";
  if (score === 4) return "Good";
  return "Excellent";
}

function trendArrow(current: number, previous: number | null): string {
  if (previous === null) return "";
  if (current > previous) return '<span style="color:#22c55e;margin-left:6px;">&#8593;</span>';
  if (current < previous) return '<span style="color:#ef4444;margin-left:6px;">&#8595;</span>';
  return '<span style="color:#7a9e7e;margin-left:6px;">&#8212;</span>';
}

// ---------------------------------------------------------------------------
// Position badge
// ---------------------------------------------------------------------------

function positionBadge(position: RankResult["position"]): string {
  const styles: Record<RankResult["position"], string> = {
    "top-3": "background:#22c55e;color:#0a0f0d;",
    "top-10": "background:#3b82f6;color:#fff;",
    "top-20": "background:#eab308;color:#0a0f0d;",
    "not-found": "background:#4b5563;color:#e8e6e3;",
  };
  const labels: Record<RankResult["position"], string> = {
    "top-3": "Top 3",
    "top-10": "Top 10",
    "top-20": "Top 20",
    "not-found": "Not Found",
  };
  return `<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;${styles[position]}">${labels[position]}</span>`;
}

// ---------------------------------------------------------------------------
// Severity badge
// ---------------------------------------------------------------------------

function severityBadge(severity: "high" | "medium" | "low"): string {
  const styles = {
    high: "background:#ef4444;color:#fff;",
    medium: "background:#eab308;color:#0a0f0d;",
    low: "background:#3b82f6;color:#fff;",
  };
  return `<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;${styles[severity]}">${severity.toUpperCase()}</span>`;
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

function buildHtml(
  config: SeoConfig,
  audit: AuditResult,
  rankings: RankResult[],
  previousAudit: SeoAudit | null,
  aiInsights: string | null
): string {
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prev = previousAudit
    ? {
        onpage: previousAudit.score_onpage,
        technical: previousAudit.score_technical,
        content: previousAudit.score_content,
        local: previousAudit.score_local,
        speed: previousAudit.score_speed,
        aiVisibility: previousAudit.score_ai_visibility,
      }
    : null;

  // Score cards
  const scoreCards = [
    { label: "On-Page", key: "onpage" as const },
    { label: "Technical", key: "technical" as const },
    { label: "Content", key: "content" as const },
    { label: "Local", key: "local" as const },
    { label: "Speed", key: "speed" as const },
    { label: "AI Visibility", key: "aiVisibility" as const },
  ]
    .map(({ label, key }) => {
      const score = audit.scores[key];
      const color = scoreColor(score);
      const arrow = trendArrow(score, prev ? prev[key] : null);
      return `
        <div style="background:#141a16;border:1px solid #2a3a2e;border-radius:10px;padding:20px 16px;text-align:center;flex:1;min-width:0;">
          <div style="font-size:11px;font-weight:600;color:#7a9e7e;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">${label}</div>
          <div style="font-size:36px;font-weight:800;color:${color};line-height:1;">${score}<span style="font-size:16px;color:#7a9e7e;">/5</span>${arrow}</div>
          <div style="font-size:11px;color:#7a9e7e;margin-top:6px;">${scoreLabel(score)}</div>
        </div>`;
    })
    .join("\n");

  // Rankings table rows
  const rankingRows = rankings.length
    ? rankings
        .map((r) => {
          const topComp = r.competitorPositions
            ? Object.entries(r.competitorPositions)
                .filter(([, pos]) => pos && pos !== "not-found")
                .sort((a, b) => {
                  const order = { "top-3": 0, "top-10": 1, "top-20": 2, "not-found": 3 };
                  return (
                    (order[a[1] as keyof typeof order] ?? 3) -
                    (order[b[1] as keyof typeof order] ?? 3)
                  );
                })
                .map(([name, pos]) => `${name}: ${pos}`)
                .join(", ") || "—"
            : "—";

          return `
          <tr style="border-bottom:1px solid #1e2820;">
            <td style="padding:12px 16px;color:#e8e6e3;font-size:13px;">${r.keyword}</td>
            <td style="padding:12px 16px;text-align:center;">${positionBadge(r.position)}</td>
            <td style="padding:12px 16px;text-align:center;color:${r.aiOverview ? "#22c55e" : "#4b5563"};font-size:13px;font-weight:600;">${r.aiOverview ? "Yes" : "No"}</td>
            <td style="padding:12px 16px;color:#7a9e7e;font-size:12px;">—</td>
            <td style="padding:12px 16px;color:#7a9e7e;font-size:12px;">${topComp}</td>
          </tr>`;
        })
        .join("\n")
    : `<tr><td colspan="5" style="padding:24px;text-align:center;color:#4b5563;font-size:13px;">No ranking data available.</td></tr>`;

  // Issues table rows
  const issueRows = audit.issues.length
    ? audit.issues
        .map(
          (issue) => `
          <tr style="border-bottom:1px solid #1e2820;">
            <td style="padding:12px 16px;color:#c4a265;font-size:13px;font-weight:600;">${issue.area}</td>
            <td style="padding:12px 16px;color:#e8e6e3;font-size:13px;">${issue.finding}</td>
            <td style="padding:12px 16px;text-align:center;">${severityBadge(issue.severity)}</td>
            <td style="padding:12px 16px;color:#7a9e7e;font-size:12px;">${issue.impact}</td>
          </tr>`
        )
        .join("\n")
    : `<tr><td colspan="4" style="padding:24px;text-align:center;color:#4b5563;font-size:13px;">No issues found.</td></tr>`;

  // Recommendations
  const recItems = audit.recommendations.length
    ? audit.recommendations
        .sort((a, b) => a.priority - b.priority)
        .map(
          (rec, i) => `
          <div style="display:flex;gap:16px;align-items:flex-start;padding:14px 0;border-bottom:1px solid #1e2820;">
            <div style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#7a9e7e;color:#0a0f0d;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;">${i + 1}</div>
            <div style="flex:1;">
              <div style="color:#e8e6e3;font-size:13px;font-weight:600;margin-bottom:4px;">${rec.action}</div>
              <div style="color:#7a9e7e;font-size:12px;">Impact: ${rec.impact}</div>
            </div>
            <div style="flex-shrink:0;font-size:11px;font-weight:700;color:#c4a265;text-transform:uppercase;letter-spacing:1px;padding:3px 10px;border:1px solid #c4a265;border-radius:6px;">P${rec.priority}</div>
          </div>`
        )
        .join("\n")
    : `<div style="padding:24px;text-align:center;color:#4b5563;font-size:13px;">No recommendations at this time.</div>`;

  // AI Insights section
  const aiInsightsSection = aiInsights
    ? `
    <div style="margin-top:32px;">
      <h2 style="font-size:16px;font-weight:700;color:#c4a265;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px 0;padding-bottom:8px;border-bottom:1px solid #2a3a2e;">AI Insights</h2>
      <div style="background:#141a16;border:1px solid #2a3a2e;border-left:3px solid #c4a265;border-radius:8px;padding:20px 24px;">
        <p style="color:#e8e6e3;font-size:13px;line-height:1.8;margin:0;white-space:pre-line;">${aiInsights}</p>
      </div>
    </div>`
    : "";

  const sectionHeadingStyle =
    "font-size:16px;font-weight:700;color:#7a9e7e;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px 0;padding-bottom:8px;border-bottom:1px solid #2a3a2e;";

  const tableHeadStyle =
    "background:#1e2820;color:#7a9e7e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SEO Audit Report – ${config.website_url}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0a0f0d;
      color: #e8e6e3;
      font-size: 14px;
      line-height: 1.6;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; vertical-align: top; }
  </style>
</head>
<body style="padding:0;margin:0;background:#0a0f0d;">

  <!-- Header -->
  <div style="background:#141a16;border-bottom:2px solid #7a9e7e;padding:28px 40px;display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:22px;font-weight:900;color:#e8e6e3;letter-spacing:-0.5px;">
        Ophidian<span style="color:#39ff14;">AI</span>
      </div>
      <div style="font-size:12px;color:#7a9e7e;margin-top:2px;text-transform:uppercase;letter-spacing:2px;">SEO Audit Report</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:14px;font-weight:600;color:#c4a265;">${config.website_url}</div>
      <div style="font-size:12px;color:#7a9e7e;margin-top:4px;">${reportDate}</div>
      ${config.location ? `<div style="font-size:11px;color:#4b5563;margin-top:2px;">${config.location}</div>` : ""}
    </div>
  </div>

  <!-- Body -->
  <div style="padding:36px 40px;max-width:1100px;margin:0 auto;">

    <!-- Score Cards -->
    <div style="margin-bottom:40px;">
      <h2 style="${sectionHeadingStyle}">Audit Scores</h2>
      <div style="display:flex;gap:12px;flex-wrap:nowrap;">
        ${scoreCards}
      </div>
    </div>

    <!-- Rankings -->
    <div style="margin-bottom:40px;">
      <h2 style="${sectionHeadingStyle}">Keyword Rankings</h2>
      <div style="background:#141a16;border:1px solid #2a3a2e;border-radius:10px;overflow:hidden;">
        <table>
          <thead>
            <tr style="${tableHeadStyle}">
              <th style="padding:12px 16px;">Keyword</th>
              <th style="padding:12px 16px;text-align:center;">Visibility</th>
              <th style="padding:12px 16px;text-align:center;">AI Overview</th>
              <th style="padding:12px 16px;">Change</th>
              <th style="padding:12px 16px;">Top Competitor</th>
            </tr>
          </thead>
          <tbody>
            ${rankingRows}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Issues -->
    <div style="margin-bottom:40px;">
      <h2 style="${sectionHeadingStyle}">Issues Found</h2>
      <div style="background:#141a16;border:1px solid #2a3a2e;border-radius:10px;overflow:hidden;">
        <table>
          <thead>
            <tr style="${tableHeadStyle}">
              <th style="padding:12px 16px;">Area</th>
              <th style="padding:12px 16px;">Finding</th>
              <th style="padding:12px 16px;text-align:center;">Severity</th>
              <th style="padding:12px 16px;">Impact</th>
            </tr>
          </thead>
          <tbody>
            ${issueRows}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recommendations -->
    <div style="margin-bottom:40px;">
      <h2 style="${sectionHeadingStyle}">Recommendations</h2>
      <div style="background:#141a16;border:1px solid #2a3a2e;border-radius:10px;padding:8px 24px;">
        ${recItems}
      </div>
    </div>

    <!-- AI Insights -->
    ${aiInsightsSection}

  </div>

  <!-- Footer -->
  <div style="background:#141a16;border-top:1px solid #2a3a2e;padding:18px 40px;text-align:center;margin-top:8px;">
    <div style="font-size:11px;color:#4b5563;text-transform:uppercase;letter-spacing:2px;">
      Generated by <span style="color:#7a9e7e;">OphidianAI</span> &nbsp;|&nbsp; ophidianai.com
    </div>
  </div>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

export async function generateSeoReport(
  config: SeoConfig,
  audit: AuditResult,
  rankings: RankResult[],
  previousAudit: SeoAudit | null,
  aiInsights: string | null
): Promise<string> {
  const html = buildHtml(config, audit, rankings, previousAudit, aiInsights);

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  let pdfBuffer: Buffer;
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const rawPdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0.5in", bottom: "0.5in", left: "0.5in", right: "0.5in" },
    });
    pdfBuffer = Buffer.from(rawPdf);
  } finally {
    await browser.close();
  }

  const dateSlug = new Date().toISOString().slice(0, 10);
  const { url } = await put(
    `seo-reports/${config.id}/${dateSlug}.pdf`,
    pdfBuffer,
    { access: "public", contentType: "application/pdf" }
  );

  return url;
}
