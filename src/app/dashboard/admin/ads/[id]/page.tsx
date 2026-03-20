"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  ArrowLeft,
  Megaphone,
  BarChart3,
  Sparkles,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { AdConfig, AdCampaign, AdCopyDraft } from "@/lib/supabase/types";

interface ConfigWithClient extends AdConfig {
  clients: { company_name: string } | null;
}

interface Analytics {
  totalSpend: number;
  totalConversions: number;
  totalClicks: number;
  totalImpressions: number;
  roas: number;
  avgCpc: number;
}

interface SpendPoint {
  date: string;
  spend: number;
}

const TIER_COLORS: Record<string, string> = {
  essentials: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  growth: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminAdDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { role } = useDashboard();

  const [config, setConfig] = useState<ConfigWithClient | null>(null);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [drafts, setDrafts] = useState<AdCopyDraft[]>([]);
  const [spendData, setSpendData] = useState<SpendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Copy generator form
  const [genForm, setGenForm] = useState({
    platform: "google" as "google" | "meta",
    ad_type: "search",
    business_name: "",
    industry: "",
    location: "",
    objective: "",
    target_audience: "",
  });
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchAll() {
      const [configRes, analyticsRes, draftsRes] = await Promise.all([
        fetch(`/api/admin/ads/configs`),
        fetch(`/api/admin/ads/analytics/${id}`),
        fetch(`/api/admin/ads/copy-drafts?config_id=${id}`),
      ]);

      if (configRes.ok) {
        const all: ConfigWithClient[] = await configRes.json();
        const found = all.find((c) => c.id === id) ?? null;
        setConfig(found);
      }

      if (analyticsRes.ok) {
        setAnalytics(await analyticsRes.json());
      }

      if (draftsRes.ok) {
        setDrafts(await draftsRes.json());
      }

      // Fetch campaigns
      const campRes = await fetch(`/api/admin/ads/campaigns?config_id=${id}`);
      if (campRes.ok) {
        const campData: AdCampaign[] = await campRes.json();
        setCampaigns(campData);

        // Build spend chart from first campaign metrics as a proxy
        if (campData.length > 0) {
          const metricsRes = await fetch(
            `/api/admin/ads/metrics/${campData[0].id}?days=30`
          );
          if (metricsRes.ok) {
            const metrics = await metricsRes.json();
            setSpendData(
              metrics.map((m: { date: string; spend: number }) => ({
                date: m.date,
                spend: m.spend,
              }))
            );
          }
        }
      }

      setLoading(false);
    }

    fetchAll();
  }, [role, router, id]);

  async function handleGenerateCopy(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setGenError(null);

    const res = await fetch("/api/admin/ads/generate-copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config_id: id, ...genForm }),
    });

    if (res.ok) {
      const draft: AdCopyDraft = await res.json();
      setDrafts((prev) => [draft, ...prev]);
    } else {
      const err = await res.json();
      setGenError(err.error ?? "Generation failed");
    }

    setGenerating(false);
  }

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/admin/ads"
          className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Ad Management
        </Link>
        <p className="text-foreground-muted">Config not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/admin/ads"
            className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Ad Management
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {config.clients?.company_name ?? "Ad Config"}
          </h1>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                TIER_COLORS[config.tier] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"
              }`}
            >
              {config.tier}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${
                config.active
                  ? "bg-green-500/15 text-green-400 border-green-500/30"
                  : "bg-gray-500/15 text-gray-400 border-gray-500/30"
              }`}
            >
              {config.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total Spend", value: `$${analytics.totalSpend.toLocaleString()}` },
            { label: "Conversions", value: analytics.totalConversions.toLocaleString() },
            { label: "Clicks", value: analytics.totalClicks.toLocaleString() },
            { label: "Impressions", value: analytics.totalImpressions.toLocaleString() },
            { label: "ROAS", value: analytics.roas.toFixed(2) },
            { label: "Avg CPC", value: `$${analytics.avgCpc.toFixed(2)}` },
          ].map((stat) => (
            <GlowCard key={stat.label} className="p-4">
              <p className="text-xs text-foreground-muted">{stat.label}</p>
              <p className="text-xl font-bold text-foreground mt-1">{stat.value}</p>
            </GlowCard>
          ))}
        </div>
      )}

      {/* Platform connections */}
      <GlowCard className="p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Platform Connections</h2>
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-sm">
            {config.google_ads_connected ? (
              <CheckCircle size={16} className="text-green-400" />
            ) : (
              <XCircle size={16} className="text-foreground-dim" />
            )}
            <span className={config.google_ads_connected ? "text-foreground" : "text-foreground-muted"}>
              Google Ads
            </span>
            {config.google_ads_customer_id && (
              <span className="text-xs text-foreground-dim font-mono">
                ({config.google_ads_customer_id})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            {config.meta_connected ? (
              <CheckCircle size={16} className="text-green-400" />
            ) : (
              <XCircle size={16} className="text-foreground-dim" />
            )}
            <span className={config.meta_connected ? "text-foreground" : "text-foreground-muted"}>
              Meta Ads
            </span>
            {config.meta_ad_account_id && (
              <span className="text-xs text-foreground-dim font-mono">
                ({config.meta_ad_account_id})
              </span>
            )}
          </div>
        </div>
      </GlowCard>

      {/* Spend chart */}
      {spendData.length > 0 && (
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Daily Spend (30d)</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spendData}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--color-foreground-muted)" }}
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-foreground-muted)" }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-background)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, "Spend"]}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#spendGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlowCard>
      )}

      {/* Campaigns table */}
      <GlowCard className="overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-foreground">Campaigns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Platform</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Objective</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Daily Budget</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Start</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-foreground-muted text-sm">
                    No campaigns synced yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-sm text-foreground">{c.name}</td>
                    <td className="px-5 py-3 text-sm text-foreground-muted capitalize">{c.platform}</td>
                    <td className="px-5 py-3 text-sm text-foreground-muted">{c.objective ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-foreground-muted">
                      {c.daily_budget != null ? `$${c.daily_budget}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground-muted">
                      {c.start_date ? formatDate(c.start_date) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                          c.status === "active"
                            ? "bg-green-500/15 text-green-400 border-green-500/30"
                            : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlowCard>

      {/* AI Copy Generator */}
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">AI Copy Generator</h2>
        </div>

        <form onSubmit={handleGenerateCopy} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-foreground-muted mb-1">Platform</label>
              <select
                value={genForm.platform}
                onChange={(e) =>
                  setGenForm((f) => ({ ...f, platform: e.target.value as "google" | "meta" }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="google">Google Ads</option>
                <option value="meta">Meta Ads</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-foreground-muted mb-1">Ad Type</label>
              <select
                value={genForm.ad_type}
                onChange={(e) => setGenForm((f) => ({ ...f, ad_type: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="search">Search</option>
                <option value="display">Display</option>
                <option value="responsive">Responsive</option>
                <option value="social">Social Feed</option>
                <option value="story">Story / Reel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-foreground-muted mb-1">Business Name</label>
              <input
                type="text"
                value={genForm.business_name}
                onChange={(e) => setGenForm((f) => ({ ...f, business_name: e.target.value }))}
                placeholder="Acme Plumbing"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs text-foreground-muted mb-1">Industry</label>
              <input
                type="text"
                value={genForm.industry}
                onChange={(e) => setGenForm((f) => ({ ...f, industry: e.target.value }))}
                placeholder="Plumbing services"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-foreground-muted mb-1">Location</label>
              <input
                type="text"
                value={genForm.location}
                onChange={(e) => setGenForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Columbus, IN"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs text-foreground-muted mb-1">Target Audience</label>
              <input
                type="text"
                value={genForm.target_audience}
                onChange={(e) => setGenForm((f) => ({ ...f, target_audience: e.target.value }))}
                placeholder="Homeowners 30-65"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-foreground-muted mb-1">Campaign Objective</label>
            <input
              type="text"
              value={genForm.objective}
              onChange={(e) => setGenForm((f) => ({ ...f, objective: e.target.value }))}
              placeholder="Drive phone calls and form submissions for emergency plumbing"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:border-primary/50"
            />
          </div>

          {genError && (
            <p className="text-xs text-red-400">{genError}</p>
          )}

          <GlassButton type="submit" size="sm" disabled={generating}>
            <span className="flex items-center gap-2">
              <Sparkles size={14} />
              {generating ? "Generating..." : "Generate Copy"}
            </span>
          </GlassButton>
        </form>

        {/* Drafts list */}
        {drafts.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Generated Drafts ({drafts.length})
            </p>
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground-muted capitalize">{draft.platform}</span>
                  <span className="text-foreground-dim">·</span>
                  <span className="text-xs text-foreground-muted capitalize">{draft.ad_type}</span>
                  <span className="text-foreground-dim">·</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded border capitalize ${
                      draft.status === "draft"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        : "bg-green-500/10 text-green-400 border-green-500/30"
                    }`}
                  >
                    {draft.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-1">Headlines</p>
                  <div className="flex flex-wrap gap-1">
                    {draft.headlines.map((h, i) => (
                      <span key={i} className="text-xs bg-white/5 rounded px-2 py-0.5 text-foreground">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted mb-1">Descriptions</p>
                  {draft.descriptions.map((d, i) => (
                    <p key={i} className="text-xs text-foreground/80">
                      {d}
                    </p>
                  ))}
                </div>
                {draft.call_to_action && (
                  <p className="text-xs text-foreground-muted">
                    CTA: <span className="text-foreground">{draft.call_to_action}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </GlowCard>
    </div>
  );
}
