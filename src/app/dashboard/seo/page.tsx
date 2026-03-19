"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { ModuleGuard } from "@/components/dashboard/module-guard";

// ── Types ──────────────────────────────────────────────────────────────────

type ScoreCategory = "on_page" | "technical" | "content" | "local" | "speed" | "ai_visibility";

interface ScoreCard {
  category: ScoreCategory;
  label: string;
  score: number;
  previous_score?: number | null;
}

interface RankingRow {
  keyword: string;
  visibility_tier: "top_3" | "top_10" | "top_20" | "not_found";
  ai_overview: boolean;
  best_competitor?: string | null;
}

interface IssueCard {
  area: string;
  finding: string;
  severity: "high" | "medium" | "low";
  impact: string;
}

interface ReportEntry {
  id: string;
  month: string; // e.g. "March 2026"
  generated_at: string;
  pdf_url: string;
}

interface GbpDraft {
  id: string;
  content: string;
  status: "pending" | "approved" | "expired";
  created_at: string;
}

interface SeoAuditData {
  scores: ScoreCard[];
  rankings: RankingRow[];
  issues: IssueCard[];
  reports: ReportEntry[];
  gbp_drafts?: GbpDraft[];
  ai_insights?: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function scoreBg(score: number): string {
  if (score <= 2) return "bg-[#ef4444]/10 border-[#ef4444]/30";
  if (score === 3) return "bg-[#eab308]/10 border-[#eab308]/30";
  return "bg-[#22c55e]/10 border-[#22c55e]/30";
}

function TrendArrow({ current, previous }: { current: number; previous?: number | null }) {
  if (previous == null) return null;
  if (current > previous) return <span className="text-[#22c55e] text-sm ml-1">&#8593;</span>;
  if (current < previous) return <span className="text-[#ef4444] text-sm ml-1">&#8595;</span>;
  return <span className="text-foreground-dim text-sm ml-1">&#8212;</span>;
}

function VisibilityBadge({ tier }: { tier: RankingRow["visibility_tier"] }) {
  const config: Record<RankingRow["visibility_tier"], { label: string; className: string }> = {
    top_3: { label: "Top 3", className: "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30" },
    top_10: { label: "Top 10", className: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
    top_20: { label: "Top 20", className: "bg-[#eab308]/15 text-[#eab308] border border-[#eab308]/30" },
    not_found: { label: "Not Found", className: "bg-white/5 text-foreground-dim border border-white/10" },
  };
  const { label, className } = config[tier];
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: IssueCard["severity"] }) {
  const config: Record<IssueCard["severity"], { label: string; className: string }> = {
    high: { label: "High", className: "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30" },
    medium: { label: "Medium", className: "bg-[#eab308]/15 text-[#eab308] border border-[#eab308]/30" },
    low: { label: "Low", className: "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30" },
  };
  const { label, className } = config[severity];
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function GbpStatusBadge({ status }: { status: GbpDraft["status"] }) {
  const config: Record<GbpDraft["status"], { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-[#eab308]/15 text-[#eab308] border border-[#eab308]/30" },
    approved: { label: "Approved", className: "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30" },
    expired: { label: "Expired", className: "bg-white/5 text-foreground-dim border border-white/10" },
  };
  const { label, className } = config[status];
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

const SCORE_LABELS: Record<ScoreCategory, string> = {
  on_page: "On-Page",
  technical: "Technical",
  content: "Content",
  local: "Local",
  speed: "Speed",
  ai_visibility: "AI Visibility",
};

// ── Page ───────────────────────────────────────────────────────────────────

export default function SeoPage() {
  const { modules, clientId } = useDashboard();

  return (
    <ModuleGuard modules={modules} required="seo_performance">
      <SeoContent clientId={clientId} />
    </ModuleGuard>
  );
}

function SeoContent({ clientId }: { clientId: string | null }) {
  const [data, setData] = useState<SeoAuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!clientId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/seo/dashboard?clientId=${clientId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [clientId]);

  async function handleApprove(draftId: string) {
    setApprovingId(draftId);
    try {
      const res = await fetch(`/api/seo/gbp-drafts/${draftId}/approve`, { method: "POST" });
      if (res.ok) {
        setApprovedIds((prev) => new Set(prev).add(draftId));
      }
    } finally {
      setApprovingId(null);
    }
  }

  // ── Loading skeleton ──

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">SEO Audit</h1>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl border border-primary/10 p-6 animate-pulse">
              <div className="h-4 w-24 bg-white/5 rounded" />
              <div className="h-8 w-10 bg-white/5 rounded mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">SEO Audit</h1>
        <div className="glass rounded-xl border border-primary/10 p-12 text-center">
          <p className="text-foreground-dim text-lg mb-2">No SEO data yet</p>
          <p className="text-foreground-dim text-sm">
            Your first audit will appear here after your site is analyzed.
          </p>
        </div>
      </div>
    );
  }

  const pendingDrafts = (data.gbp_drafts ?? []).filter((d) => d.status === "pending" && !approvedIds.has(d.id));
  const allDrafts = data.gbp_drafts ?? [];
  const showGbp = allDrafts.length > 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">SEO Audit</h1>

      {/* ── Score Cards ── */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Audit Scores</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {data.scores.map((s) => (
            <div
              key={s.category}
              className={`glass rounded-xl border p-5 ${scoreBg(s.score)}`}
            >
              <p className="text-sm text-foreground-dim font-medium">
                {SCORE_LABELS[s.category] ?? s.category}
              </p>
              <div className="flex items-end gap-1 mt-2">
                <span
                  className={`text-3xl font-bold ${
                    s.score <= 2
                      ? "text-[#ef4444]"
                      : s.score === 3
                      ? "text-[#eab308]"
                      : "text-[#22c55e]"
                  }`}
                >
                  {s.score}
                </span>
                <span className="text-foreground-dim text-sm mb-0.5">/5</span>
                <TrendArrow current={s.score} previous={s.previous_score} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Rankings Table ── */}
      {data.rankings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Keyword Visibility</h2>
          <div className="glass rounded-xl border border-primary/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-5 text-foreground-dim font-medium">Keyword</th>
                    <th className="text-left py-3 px-4 text-foreground-dim font-medium">Visibility</th>
                    <th className="text-left py-3 px-4 text-foreground-dim font-medium">AI Overview</th>
                    <th className="text-left py-3 px-5 text-foreground-dim font-medium">Best Competitor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rankings.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-3 px-5 text-foreground">{row.keyword}</td>
                      <td className="py-3 px-4">
                        <VisibilityBadge tier={row.visibility_tier} />
                      </td>
                      <td className="py-3 px-4">
                        {row.ai_overview ? (
                          <span className="text-[#22c55e]">&#10003;</span>
                        ) : (
                          <span className="text-foreground-dim">&#8212;</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-foreground-dim">
                        {row.best_competitor ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Issues ── */}
      {data.issues.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Issues Found</h2>
          <div className="space-y-3">
            {data.issues.map((issue, i) => (
              <div
                key={i}
                className="glass rounded-xl border border-primary/10 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-foreground-dim font-medium uppercase tracking-wide">
                        {issue.area}
                      </span>
                      <SeverityBadge severity={issue.severity} />
                    </div>
                    <p className="text-foreground text-sm font-medium">{issue.finding}</p>
                    <p className="text-foreground-dim text-sm mt-1">{issue.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Reports Archive ── */}
      {data.reports.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Reports</h2>
          <div className="glass rounded-xl border border-primary/10 divide-y divide-white/5">
            {data.reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="text-foreground text-sm font-medium">{report.month}</p>
                  <p className="text-foreground-dim text-xs mt-0.5">
                    Generated{" "}
                    {new Date(report.generated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <a
                  href={report.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Download PDF
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── GBP Drafts ── */}
      {showGbp && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Google Business Profile Drafts</h2>
          <div className="space-y-3">
            {allDrafts.map((draft) => {
              const isApproved = approvedIds.has(draft.id);
              const effectiveStatus = isApproved ? "approved" : draft.status;
              return (
                <div
                  key={draft.id}
                  className="glass rounded-xl border border-primary/10 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GbpStatusBadge status={effectiveStatus} />
                        <span className="text-xs text-foreground-dim">
                          {new Date(draft.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-foreground text-sm line-clamp-3">{draft.content}</p>
                    </div>
                    {effectiveStatus === "pending" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(draft.id)}
                        disabled={approvingId === draft.id}
                        className="shrink-0 px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 text-sm font-medium hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {approvingId === draft.id ? "Approving..." : "Approve"}
                      </button>
                    )}
                    {effectiveStatus === "approved" && (
                      <span className="shrink-0 text-[#22c55e] text-sm font-medium">Approved</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {pendingDrafts.length === 0 && allDrafts.some((d) => d.status === "pending") === false && (
            <p className="text-foreground-dim text-sm mt-3">
              All drafts have been reviewed. New drafts are generated monthly.
            </p>
          )}
        </section>
      )}

      {/* ── AI Insights ── */}
      {data.ai_insights && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">AI Insights</h2>
          <div className="glass rounded-xl border border-primary/10 p-6">
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {data.ai_insights}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
