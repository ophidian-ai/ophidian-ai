"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  Megaphone,
  DollarSign,
  MousePointerClick,
  TrendingUp,
  Eye,
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

interface AdCampaignSummary {
  id: string;
  platform: string;
  name: string;
  status: string;
  daily_budget: number | null;
  start_date: string | null;
  end_date: string | null;
}

interface DashboardData {
  config: {
    id: string;
    tier: string;
    google_ads_connected: boolean;
    meta_connected: boolean;
    monthly_ad_budget: number | null;
  };
  stats: {
    totalSpend: number;
    totalConversions: number;
    totalClicks: number;
    totalImpressions: number;
    avgCpc: number;
  };
  campaigns: AdCampaignSummary[];
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <GlowCard className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-foreground-muted">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
      </div>
    </GlowCard>
  );
}

export default function ClientAdsPage() {
  const router = useRouter();
  const { role, modules } = useDashboard();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    if (role === "admin") {
      router.replace("/dashboard/admin/ads");
      return;
    }

    if (!modules.has("ad_management")) {
      router.replace("/dashboard");
      return;
    }

    async function fetchData() {
      const res = await fetch("/api/ads/dashboard");
      if (res.status === 404) {
        setNotConfigured(true);
      } else if (res.ok) {
        setData(await res.json());
      }
      setLoading(false);
    }

    fetchData();
  }, [role, modules, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Megaphone size={40} className="text-foreground-dim" />
        <p className="text-foreground-muted text-sm">
          Ad management has not been configured for your account yet.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { config, stats, campaigns } = data;

  // Placeholder spend chart data based on aggregate stats
  const chartData = campaigns.slice(0, 7).map((c, i) => ({
    name: c.name.slice(0, 12),
    spend: stats.totalSpend > 0 ? Math.round((stats.totalSpend / Math.max(campaigns.length, 1)) * 10) / 10 : 0,
    day: i,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ad Management</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Lifetime performance across all campaigns
        </p>
      </div>

      {/* Platform status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm">
          {config.google_ads_connected ? (
            <CheckCircle size={14} className="text-green-400" />
          ) : (
            <XCircle size={14} className="text-foreground-dim" />
          )}
          <span className={config.google_ads_connected ? "text-foreground" : "text-foreground-muted"}>
            Google Ads
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          {config.meta_connected ? (
            <CheckCircle size={14} className="text-green-400" />
          ) : (
            <XCircle size={14} className="text-foreground-dim" />
          )}
          <span className={config.meta_connected ? "text-foreground" : "text-foreground-muted"}>
            Meta Ads
          </span>
        </div>
        {config.monthly_ad_budget != null && (
          <span className="text-xs text-foreground-muted ml-auto">
            Monthly budget: ${config.monthly_ad_budget.toLocaleString()}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={DollarSign} label="Total Spend" value={`$${stats.totalSpend.toLocaleString()}`} />
        <StatCard icon={TrendingUp} label="Conversions" value={stats.totalConversions.toLocaleString()} />
        <StatCard icon={MousePointerClick} label="Clicks" value={stats.totalClicks.toLocaleString()} />
        <StatCard icon={Eye} label="Impressions" value={stats.totalImpressions.toLocaleString()} />
        <StatCard icon={DollarSign} label="Avg CPC" value={`$${stats.avgCpc.toFixed(2)}`} />
      </div>

      {/* Spend chart */}
      {chartData.length > 0 && (
        <GlowCard className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Spend by Campaign</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="clientSpendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--color-foreground-muted)" }}
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
                formatter={(v: number) => [`$${v.toFixed(2)}`, "Spend"]}
              />
              <Area
                type="monotone"
                dataKey="spend"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#clientSpendGrad)"
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
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Daily Budget</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Start</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-foreground-muted text-sm">
                    No campaigns yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-sm text-foreground">{c.name}</td>
                    <td className="px-5 py-3 text-sm text-foreground-muted capitalize">{c.platform}</td>
                    <td className="px-5 py-3 text-sm text-foreground-muted">
                      {c.daily_budget != null ? `$${c.daily_budget}/day` : "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground-muted">
                      {c.start_date
                        ? new Date(c.start_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
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
    </div>
  );
}
