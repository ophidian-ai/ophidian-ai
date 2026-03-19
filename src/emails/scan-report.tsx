/**
 * Scan Report Email Template
 *
 * Builds a plain HTML email for the Revenue Leak Report delivery.
 * No @react-email dependencies -- returns a raw HTML string.
 */

export interface ScanReportEmailParams {
  score: number;
  grade: string;
  monthlyLeak: number;
  quickWins: string[];
  reportUrl: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildScanReportEmail(params: ScanReportEmailParams): string {
  const { score, grade, monthlyLeak, quickWins, reportUrl } = params;

  const topWins = quickWins.slice(0, 3);

  const quickWinsHtml =
    topWins.length > 0
      ? topWins
          .map(
            (win) => `
        <li style="margin-bottom:8px;color:#cbd5e1;font-size:15px;line-height:1.5;">${win}</li>`,
          )
          .join('')
      : '<li style="margin-bottom:8px;color:#cbd5e1;font-size:15px;">No quick wins identified.</li>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Website Revenue Leak Report is Ready</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;border-bottom:2px solid #14b8a6;padding:32px 40px 28px;border-radius:8px 8px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:700;color:#f8fafc;letter-spacing:-0.5px;">Ophidian<span style="color:#14b8a6;">AI</span></span>
                  </td>
                  <td align="right">
                    <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Revenue Leak Report</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#1e293b;padding:40px;">

              <!-- Headline -->
              <p style="margin:0 0 8px;font-size:13px;color:#14b8a6;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your report is ready</p>
              <h1 style="margin:0 0 32px;font-size:26px;font-weight:700;color:#f8fafc;line-height:1.3;">Website Revenue Leak Analysis</h1>

              <!-- Score Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border:1px solid #334155;border-radius:8px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:80px;text-align:center;vertical-align:middle;">
                          <div style="width:64px;height:64px;border-radius:50%;background-color:#0f172a;border:3px solid #14b8a6;display:inline-block;text-align:center;line-height:58px;">
                            <span style="font-size:22px;font-weight:800;color:#14b8a6;">${grade}</span>
                          </div>
                        </td>
                        <td style="padding-left:20px;vertical-align:middle;">
                          <p style="margin:0 0 4px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Overall Score</p>
                          <p style="margin:0 0 6px;font-size:28px;font-weight:800;color:#f8fafc;">${score}<span style="font-size:16px;font-weight:400;color:#64748b;">/100</span></p>
                          <p style="margin:0;font-size:14px;color:#94a3b8;">Estimated <strong style="color:#f87171;">${formatCurrency(monthlyLeak)}/mo</strong> in lost revenue</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Quick Wins -->
              <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Top Quick Wins</p>
              <ul style="margin:0 0 32px;padding-left:20px;">
                ${quickWinsHtml}
              </ul>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${reportUrl}" style="display:inline-block;background-color:#14b8a6;color:#0f172a;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:6px;letter-spacing:0.3px;">View Full Report</a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:36px 0 0;">
                <tr>
                  <td style="border-top:1px solid #334155;padding-top:24px;">
                    <p style="margin:0 0 6px;font-size:13px;color:#64748b;line-height:1.6;">
                      Your full report includes a detailed breakdown of every issue found, revenue impact estimates, and prioritized recommendations.
                    </p>
                    <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
                      Questions? Reply to this email or reach us at <a href="mailto:hello@ophidianai.com" style="color:#14b8a6;text-decoration:none;">hello@ophidianai.com</a>.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;border-top:1px solid #1e293b;padding:24px 40px;border-radius:0 0 8px 8px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#f8fafc;">OphidianAI</p>
                    <p style="margin:0;font-size:12px;color:#475569;">
                      <a href="https://ophidianai.com" style="color:#14b8a6;text-decoration:none;">ophidianai.com</a>
                      &nbsp;&middot;&nbsp;Columbus, Indiana
                      &nbsp;&middot;&nbsp;
                      <a href="mailto:hello@ophidianai.com" style="color:#475569;text-decoration:none;">hello@ophidianai.com</a>
                    </p>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <p style="margin:0;font-size:11px;color:#334155;">You received this because you requested a scan.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
