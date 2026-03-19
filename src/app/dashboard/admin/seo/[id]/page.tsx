"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  ArrowLeft,
  Search,
  Mail,
  ExternalLink,
  FileText,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SeoConfig {
  id: string;
  website_url: string;
  tier: string;
  keywords: string[];
  industry: string | null;
  location: string | null;
  gbp_url: string | null;
  delivery_email: string;
  last_audit_at: string | null;
  clients: { company_name: string } | null;
  competitors: { name: string; url: string }[];
}

interface ScoreSnapshot {
  created_at: string;
  technical_score: number | null;
  content_score: number | null;
  backlink_score: number | null;
  local_score: number | null;
  performance_score: number | null;
  mobile_score: number | null;
}

interface KeywordRanking {
  id: string;
  keyword: string;
  position: number | null;
  previous_position: number | null;
  url: string | null;
  checked_at: string;
}

interface SeoIssue {
  id: string;
  category: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string | null;
  resolved: boolean;
}

interface GbpDraft {
  id: string;
  post_type: string;
  content: string;
  status: string;
  created_at: string;
}

interface SeoReport {
  id: string;
  report_type: string;
  file_url: string | null;
  created_at: string;
  overall_score: number | null;
}

interface Analytics {
  score_history: ScoreSnapshot[];
  latest_rankings: KeywordRanking[];
  issues: SeoIssue[];
  gbp_drafts: GbpDraft[];
  reports: SeoReport[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TIER_COLORS: Record<string, string> = {
  essentials: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  growth: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  warning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const GBP_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  approved: "bg-green-500/15 text-green-400 border-green-500/30",
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

const SCORE_LINES = [
  { key: "technical_score", name: "Technical", color: "#C4A265" },
  { key: "content_score", name: "Content", color: "#7A9E7E" },
  { key: "backlink_score", name: "Backlinks", color: "#9B8EC4" },
  { key: "local_score", name: "Local", color: "#D4B87A" },
  { key: "performance_score", name: "Performance", color: "#6BAFCA" },
  { key: "mobile_score", name: "Mobile", color: "#E07C7C" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatChartDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function positionDelta(curr: number | null, prev: number | null): React.ReactNode {
  if (curr === null) return <span className="text-foreground-muted">-</span>;
  if (prev === null) return <span className="text-foreground">{curr}</span>;
  const diff = prev - curr; // positive = improved (lower position is better)
  if (diff > 0) return <span className="text-green-400">{curr} <span className="text-xs">(+{diff})</span></span>;
  if (diff < 0) return <span className="text-red-400">{curr} <span className="text-xs">({diff})</span></span>;
  return <span className="text-foreground">{curr}</span>;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SeoConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { role } = useDashboard();
  const [config, setConfig] = useState<SeoConfig | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [running, setRunning] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" }[]>([]);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchData() {
      const [configRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/seo/configs/${id}`),
        fetch(`/api/admin/seo/analytics/${id}?days=90`),
      ]);

      if (configRes.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data.config ?? data);
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      setLoading(false);
    }

    fetchData();
  }, [id, role, router]);

  if (role !== "admin") return null;

  function addToast(message: string, type: "success" | "error") {
    const toastId = crypto.randomUUID();
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 5000);
  }

  async function handleRunNow() {
    setRunning(true);
    try {
      const res = await fetch(`/api/admin/seo/configs/${id}/run`, {
        method: "POST",
      });
      if (res.status === 429) {
        addToast("Audit already ran today.", "error");
      } else if (res.ok) {
        addToast("Audit started. Results in ~5 minutes.", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.error ?? "Failed to start audit.", "error");
      }
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-foreground-muted">Config not found.</p>
        <Link href="/dashboard/admin/seo" className="text-primary text-sm hover:underline">
          Back to SEO
        </Link>
      </div>
    );
  }

  // Build chart data from score history
  const chartData = (analytics?.score_history ?? []).map((s) => ({
    date: formatChartDate(s.created_at),
    technical_score: s.technical_score,
    content_score: s.content_score,
    backlink_score: s.backlink_score,
    local_score: s.local_score,
    performance_score: s.performance_score,
    mobile_score: s.mobile_score,
  }));

  const openIssues = (analytics?.issues ?? []).filter((i) => !i.resolved);
  const resolvedIssues = (analytics?.issues ?? []).filter((i) => i.resolved);

  return (
    <div className="space-y-6">
      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-lg border text-sm shadow-lg backdrop-blur-sm ${
                t.type === "success"
                  ? "bg-green-500/15 text-green-400 border-green-500/30"
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {config.clients?.company_name ?? "Unassigned"}
              </h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                  TIER_COLORS[config.tier] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"
                }`}
              >
                {config.tier}
              </span>
            </div>
            <p className="text-foreground-muted text-sm mt-0.5 font-mono">{config.website_url}</p>
          </div>
        </div>
        <button
          onClick={handleRunNow}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {running ? (
            <>
              <div className="w-4 h-4 border border-primary border-t-transparent rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Search size={16} />
              Run Now
            </>
          )}
        </button>
      </div>

      {/* Config Summary */}
      <GlowCard className="p-5">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
          Configuration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">URL</p>
            <a
              href={config.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-mono text-xs flex items-center gap-1"
            >
              {config.website_url}
              <ExternalLink size={11} />
            </a>
          </div>
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">Tier</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                TIER_COLORS[config.tier] ?? ""
              }`}
            >
              {config.tier}
            </span>
          </div>
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">Keywords</p>
            <p className="text-foreground">{config.keywords?.length ?? 0} keywords</p>
          </div>
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">Last Audit</p>
            <p className="text-foreground">{formatDate(config.last_audit_at)}</p>
          </div>
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              Delivery Email
            </p>
            <div className="flex items-center gap-1.5">
              <Mail size={13} className="text-foreground-muted" />
              <span className="text-foreground">{config.delivery_email}</span>
            </div>
          </div>
          {config.industry && (
            <div>
              <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">Industry</p>
              <p className="text-foreground">{config.industry}</p>
            </div>
          )}
          {config.location && (
            <div>
              <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">Location</p>
              <p className="text-foreground">{config.location}</p>
            </div>
          )}
          {config.gbp_url && (
            <div>
              <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">GBP</p>
              <a
                href={config.gbp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs flex items-center gap-1"
              >
                View Profile
                <ExternalLink size={11} />
              </a>
            </div>
          )}
        </div>
        {config.keywords?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-2">
              Target Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {config.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-foreground-muted"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </GlowCard>

      {/* Score Trend Chart */}
      {chartData.length > 0 && (
        <GlowCard className="p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
            Score Trends (90 days)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10,10,15,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                />
                {SCORE_LINES.map((line) => (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    name={line.name}
                    stroke={line.color}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlowCard>
      )}

      {/* Rankings + Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rankings */}
        <GlowCard className="p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
            Keyword Rankings
          </h2>
          {(analytics?.latest_rankings ?? []).length === 0 ? (
            <p className="text-foreground-muted text-sm">No ranking data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left pb-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Keyword
                    </th>
                    <th className="text-right pb-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics!.latest_rankings.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-2.5 text-foreground pr-4">{r.keyword}</td>
                      <td className="py-2.5 text-right">
                        {positionDelta(r.position, r.previous_position)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlowCard>

        {/* Issues */}
        <GlowCard className="p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
            Issues
            {openIssues.length > 0 && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 normal-case">
                {openIssues.length} open
              </span>
            )}
          </h2>
          {openIssues.length === 0 && resolvedIssues.length === 0 ? (
            <p className="text-foreground-muted text-sm">No issues found yet.</p>
          ) : (
            <ul className="space-y-3">
              {[...openIssues, ...resolvedIssues].slice(0, 10).map((issue) => (
                <li
                  key={issue.id}
                  className="pb-3 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full border capitalize shrink-0 mt-0.5 ${
                        issue.resolved
                          ? "bg-gray-500/15 text-gray-400 border-gray-500/30"
                          : (SEVERITY_COLORS[issue.severity] ?? "")
                      }`}
                    >
                      {issue.resolved ? "resolved" : issue.severity}
                    </span>
                    <div>
                      <p className={`text-sm ${issue.resolved ? "text-foreground-muted line-through" : "text-foreground"}`}>
                        {issue.title}
                      </p>
                      {issue.description && !issue.resolved && (
                        <p className="text-xs text-foreground-muted mt-0.5">{issue.description}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlowCard>
      </div>

      {/* GBP Drafts */}
      {(analytics?.gbp_drafts ?? []).length > 0 && (
        <GlowCard className="p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
            GBP Post Drafts
          </h2>
          <div className="space-y-3">
            {analytics!.gbp_drafts.map((draft) => (
              <div
                key={draft.id}
                className="pb-3 border-b border-white/5 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-foreground-muted capitalize">
                        {draft.post_type}
                      </span>
                      <span className="text-foreground-dim text-xs">·</span>
                      <span className="text-xs text-foreground-muted">{formatDate(draft.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{draft.content}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                      GBP_STATUS_COLORS[draft.status] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"
                    }`}
                  >
                    {draft.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      )}

      {/* Reports Archive */}
      {(analytics?.reports ?? []).length > 0 && (
        <GlowCard className="p-5">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
            Reports Archive
          </h2>
          <div className="space-y-2">
            {analytics!.reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <FileText size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground capitalize">
                      {report.report_type.replace(/_/g, " ")} Report
                    </p>
                    <p className="text-xs text-foreground-muted">{formatDate(report.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {report.overall_score !== null && (
                    <span
                      className={`text-sm font-semibold ${
                        report.overall_score >= 80
                          ? "text-green-400"
                          : report.overall_score >= 60
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {report.overall_score}/100
                    </span>
                  )}
                  {report.file_url ? (
                    <a
                      href={report.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                    >
                      <Download size={14} />
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-foreground-muted">No file</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
