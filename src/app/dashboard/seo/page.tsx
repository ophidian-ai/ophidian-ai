"use client";

import { useEffect, useState, useMemo } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { ModuleGuard } from "@/components/dashboard/module-guard";
import { GlowCard } from "@/components/ui/spotlight-card";
import { createClient } from "@/lib/supabase/client";
import type { ClientSeoMetrics } from "@/lib/supabase/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DateRange = "7d" | "30d" | "90d";

const RANGE_DAYS: Record<DateRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

export default function SeoPage() {
  const { modules, clientId } = useDashboard();

  return (
    <ModuleGuard modules={modules} required="seo_performance">
      <SeoContent clientId={clientId} />
    </ModuleGuard>
  );
}

function SeoContent({ clientId }: { clientId: string | null }) {
  const [data, setData] = useState<ClientSeoMetrics[]>([]);
  const [range, setRange] = useState<DateRange>("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    async function fetchData() {
      setLoading(true);
      const supabase = createClient();
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - RANGE_DAYS[range]);

      const { data: seoData } = await supabase
        .from("client_seo_metrics")
        .select("*")
        .eq("client_id", clientId)
        .gte("date", daysAgo.toISOString().split("T")[0])
        .order("date", { ascending: true });

      setData(seoData ?? []);
      setLoading(false);
    }

    fetchData();
  }, [clientId, range]);

  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const totalImpressions = data.reduce((sum, d) => sum + d.impressions, 0);
    const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
    const avgPosition =
      data.filter((d) => d.avg_position !== null).reduce((sum, d) => sum + (d.avg_position ?? 0), 0) /
      (data.filter((d) => d.avg_position !== null).length || 1);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const latestIndexed = data[data.length - 1]?.indexed_pages;
    return { totalImpressions, totalClicks, avgPosition, ctr, indexedPages: latestIndexed };
  }, [data]);

  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      impressions: d.impressions,
      clicks: d.clicks,
    }));
  }, [data]);

  const topQueries = useMemo(() => {
    const queryMap: Record<string, { impressions: number; clicks: number; positions: number[]; }> = {};
    for (const d of data) {
      if (d.top_queries) {
        for (const q of d.top_queries) {
          if (!queryMap[q.query]) {
            queryMap[q.query] = { impressions: 0, clicks: 0, positions: [] };
          }
          queryMap[q.query].impressions += q.impressions;
          queryMap[q.query].clicks += q.clicks;
          queryMap[q.query].positions.push(q.position);
        }
      }
    }
    return Object.entries(queryMap)
      .map(([query, data]) => ({
        query,
        impressions: data.impressions,
        clicks: data.clicks,
        position: data.positions.reduce((a, b) => a + b, 0) / data.positions.length,
        ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
      }))
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 20);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">SEO Performance</h1>
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
            SEO data will appear after your site is indexed and Search Console is configured.
          </p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <GlowCard className="rounded-xl border border-primary/10 p-6">
                <p className="text-sm text-foreground-dim">Impressions</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats.totalImpressions.toLocaleString()}
                </p>
              </GlowCard>
              <GlowCard className="rounded-xl border border-primary/10 p-6">
                <p className="text-sm text-foreground-dim">Clicks</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats.totalClicks.toLocaleString()}
                </p>
              </GlowCard>
              <GlowCard className="rounded-xl border border-primary/10 p-6">
                <p className="text-sm text-foreground-dim">Avg Position</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats.avgPosition.toFixed(1)}
                </p>
              </GlowCard>
              <GlowCard className="rounded-xl border border-primary/10 p-6">
                <p className="text-sm text-foreground-dim">CTR</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats.ctr.toFixed(1)}%
                </p>
              </GlowCard>
            </div>
          )}

          {/* Indexed Pages */}
          {stats?.indexedPages != null && (
            <div className="glass rounded-xl border border-primary/10 p-4 text-sm">
              <span className="text-foreground-dim">Indexed Pages: </span>
              <span className="text-foreground font-medium">{stats.indexedPages}</span>
            </div>
          )}

          {/* Search Performance Chart */}
          <div className="glass rounded-xl border border-primary/10 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Search Performance
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0A0A",
                      border: "1px solid rgba(122,158,126,0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="impressions"
                    stroke="#7A9E7E"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="clicks"
                    stroke="#C4A265"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#0DB1B2]" />
                <span className="text-foreground-dim">Impressions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#39FF14]" />
                <span className="text-foreground-dim">Clicks</span>
              </div>
            </div>
          </div>

          {/* Top Queries */}
          {topQueries.length > 0 && (
            <div className="glass rounded-xl border border-primary/10 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Top Queries</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 pr-4 text-foreground-dim font-medium">Query</th>
                      <th className="text-right py-2 px-4 text-foreground-dim font-medium">Impressions</th>
                      <th className="text-right py-2 px-4 text-foreground-dim font-medium">Clicks</th>
                      <th className="text-right py-2 px-4 text-foreground-dim font-medium">Position</th>
                      <th className="text-right py-2 pl-4 text-foreground-dim font-medium">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topQueries.map((q) => (
                      <tr key={q.query} className="border-b border-white/5">
                        <td className="py-2 pr-4 text-foreground">{q.query}</td>
                        <td className="text-right py-2 px-4 text-foreground-dim">
                          {q.impressions.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-4 text-foreground-dim">
                          {q.clicks.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-4 text-foreground-dim">
                          {q.position.toFixed(1)}
                        </td>
                        <td className="text-right py-2 pl-4 text-foreground-dim">
                          {q.ctr.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
