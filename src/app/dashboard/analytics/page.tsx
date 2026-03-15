"use client";

import { useEffect, useState, useMemo } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { ModuleGuard } from "@/components/dashboard/module-guard";
import { GlowCard } from "@/components/ui/spotlight-card";
import { createClient } from "@/lib/supabase/client";
import type { ClientAnalytics } from "@/lib/supabase/types";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DateRange = "7d" | "30d" | "90d";

const RANGE_DAYS: Record<DateRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

const PIE_COLORS = ["#39FF14", "#0DB1B2", "#6366F1", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function AnalyticsPage() {
  const { modules, clientId } = useDashboard();

  return (
    <ModuleGuard modules={modules} required="analytics">
      <AnalyticsContent clientId={clientId} />
    </ModuleGuard>
  );
}

function AnalyticsContent({ clientId }: { clientId: string | null }) {
  const [data, setData] = useState<ClientAnalytics[]>([]);
  const [range, setRange] = useState<DateRange>("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - RANGE_DAYS[range]);

      const { data: analytics } = await supabase
        .from("client_analytics")
        .select("*")
        .eq("client_id", clientId)
        .gte("date", daysAgo.toISOString().split("T")[0])
        .order("date", { ascending: true });

      setData(analytics ?? []);
      setLoading(false);
    }

    fetchData();
  }, [clientId, range]);

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const totalViews = data.reduce((sum, d) => sum + d.page_views, 0);
    const totalVisitors = data.reduce((sum, d) => sum + d.unique_visitors, 0);
    const avgBounce =
      data.filter((d) => d.bounce_rate !== null).reduce((sum, d) => sum + (d.bounce_rate ?? 0), 0) /
      (data.filter((d) => d.bounce_rate !== null).length || 1);
    const avgDuration =
      data.filter((d) => d.avg_session_duration !== null).reduce((sum, d) => sum + (d.avg_session_duration ?? 0), 0) /
      (data.filter((d) => d.avg_session_duration !== null).length || 1);
    return { totalViews, totalVisitors, avgBounce, avgDuration };
  }, [data]);

  const topPages = useMemo(() => {
    const pageMap: Record<string, number> = {};
    for (const d of data) {
      if (d.top_pages) {
        for (const p of d.top_pages) {
          pageMap[p.path] = (pageMap[p.path] ?? 0) + p.views;
        }
      }
    }
    return Object.entries(pageMap)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [data]);

  const referralSources = useMemo(() => {
    const sourceMap: Record<string, number> = {};
    for (const d of data) {
      if (d.referral_sources) {
        for (const s of d.referral_sources) {
          sourceMap[s.source] = (sourceMap[s.source] ?? 0) + s.sessions;
        }
      }
    }
    return Object.entries(sourceMap)
      .map(([source, sessions]) => ({ source, sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 6);
  }, [data]);

  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      page_views: d.page_views,
    }));
  }, [data]);

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as DateRange[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                range === r
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-foreground-dim hover:text-foreground hover:bg-white/5"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-xl border border-primary/10 p-6 animate-pulse">
              <div className="h-4 w-24 bg-white/5 rounded" />
              <div className="h-8 w-16 bg-white/5 rounded mt-2" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="glass rounded-xl border border-primary/10 p-12 text-center">
          <div className="text-foreground-dim text-4xl mb-4">--</div>
          <p className="text-foreground-dim">
            Analytics data will appear once your site is live and receiving traffic.
          </p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <GlowCard className="rounded-xl border border-primary/10 p-6">
                <p className="text-sm text-foreground-dim">Page Views</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats.totalViews.toLocaleString()}
                </p>
              </GlowCard>
              <GlowCard className="rounded-xl border border-primary/10 p-6">
                <p className="text-sm text-foreground-dim">Unique Visitors</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats.totalVisitors.toLocaleString()}
                </p>
              </GlowCard>
              <GlowCard className="rounded-xl border border-primary/10 p-6">
                <p className="text-sm text-foreground-dim">Bounce Rate</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats.avgBounce.toFixed(1)}%
                </p>
              </GlowCard>
              <GlowCard className="rounded-xl border border-primary/10 p-6">
                <p className="text-sm text-foreground-dim">Avg Session Duration</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {formatDuration(stats.avgDuration)}
                </p>
              </GlowCard>
            </div>
          )}

          {/* Traffic Trend */}
          <div className="glass rounded-xl border border-primary/10 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Traffic Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#39FF14" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0A0A",
                      border: "1px solid rgba(13,177,178,0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="page_views"
                    stroke="#39FF14"
                    fill="url(#viewsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Pages and Referral Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="glass rounded-xl border border-primary/10 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Top Pages</h2>
              {topPages.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topPages} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis type="number" stroke="#6B7280" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="path"
                        stroke="#6B7280"
                        fontSize={12}
                        width={75}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0A0A0A",
                          border: "1px solid rgba(13,177,178,0.2)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="views" fill="#0DB1B2" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-foreground-dim text-sm">No page data available.</p>
              )}
            </div>

            {/* Referral Sources */}
            <div className="glass rounded-xl border border-primary/10 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Referral Sources</h2>
              {referralSources.length > 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={referralSources}
                        dataKey="sessions"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name }) => name}
                      >
                        {referralSources.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0A0A0A",
                          border: "1px solid rgba(13,177,178,0.2)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-foreground-dim text-sm">No referral data available.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
