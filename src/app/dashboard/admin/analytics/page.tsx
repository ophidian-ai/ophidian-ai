"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AdminOverview, RevenueBreakdown } from "@/lib/analytics/overview";

const PRODUCT_COLORS: Record<string, string> = {
  chatbot: "#C4A265",
  seo: "#7A9E7E",
  email: "#6366F1",
  crm: "#F59E0B",
  review: "#EC4899",
};

const PRODUCT_LABELS: Record<string, string> = {
  chatbot: "Chatbot",
  seo: "SEO",
  email: "Email",
  crm: "CRM",
  review: "Reviews",
};

function HealthBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : score >= 40
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${color}`}>
      {score}
    </span>
  );
}

function ProductDot({ active, product }: { active: boolean; product: string }) {
  const color = active ? PRODUCT_COLORS[product] ?? "#6B7280" : "#374151";
  return (
    <span
      title={PRODUCT_LABELS[product] ?? product}
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

export default function AdminAnalyticsPage() {
  const { role } = useDashboard();
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [revenue, setRevenue] = useState<RevenueBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchData() {
      setLoading(true);
      const [ovRes, revRes] = await Promise.all([
        fetch("/api/admin/analytics/overview"),
        fetch("/api/admin/analytics/revenue"),
      ]);

      if (ovRes.ok) {
        const data = await ovRes.json();
        setOverview(data);
      }
      if (revRes.ok) {
        const data = await revRes.json();
        setRevenue(data);
      }
      setLoading(false);
    }

    fetchData();
  }, [role, router]);

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const aggregateCards = [
    {
      label: "Total MRR",
      value: revenue ? `$${revenue.totalMrr.toLocaleString()}` : "--",
      icon: DollarSign,
      color: "#C4A265",
    },
    {
      label: "Total Clients",
      value: overview?.totalClients ?? 0,
      icon: Users,
      color: "#7A9E7E",
    },
    {
      label: "Total Leads (MTD)",
      value: overview?.totalLeadsThisMonth ?? 0,
      icon: TrendingUp,
      color: "#6366F1",
    },
    {
      label: "Avg Health Score",
      value: overview?.avgHealthScore ?? 0,
      icon: Activity,
      color: "#F59E0B",
    },
    {
      label: "Churn Risk",
      value: overview?.churnRiskCount ?? 0,
      icon: AlertTriangle,
      color: (overview?.churnRiskCount ?? 0) > 0 ? "#EF4444" : "#6B7280",
    },
  ];

  const chartData = revenue?.sixMonthTrend ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 size={22} className="text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Analytics Overview</h1>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {aggregateCards.map((card) => (
          <GlowCard key={card.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  {card.label}
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{
                    color:
                      card.label === "Churn Risk" && (overview?.churnRiskCount ?? 0) > 0
                        ? "#EF4444"
                        : "var(--foreground)",
                  }}
                >
                  {card.value}
                </p>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="glass rounded-xl border border-primary/10 p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">MRR Trend (6 months)</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4A265" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C4A265" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid rgba(196,162,101,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "MRR"]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#C4A265"
                fill="url(#mrrGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client Table */}
      <div className="glass rounded-xl border border-primary/10 overflow-hidden">
        <div className="p-5 border-b border-primary/10">
          <h2 className="text-lg font-semibold text-foreground">Clients</h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            Sorted by health score (worst first)
          </p>
        </div>

        {!overview || overview.clients.length === 0 ? (
          <div className="p-8 text-center text-foreground-muted text-sm">
            No clients found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10 text-foreground-muted text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Client</th>
                  <th className="text-left px-4 py-3">Products</th>
                  <th className="text-left px-4 py-3">Health</th>
                  <th className="text-right px-4 py-3">Leads (MTD)</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {overview.clients.map((c) => (
                  <tr
                    key={c.clientId}
                    className="border-b border-primary/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{c.companyName}</p>
                      <p className="text-xs text-foreground-muted">{c.contactEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {(["chatbot", "seo", "email", "crm", "review"] as const).map(
                          (product) => (
                            <ProductDot
                              key={product}
                              product={product}
                              active={c.overview[product] !== undefined}
                            />
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <HealthBadge score={c.health.score} />
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {c.overview.totalLeadsThisMonth}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/clients/${c.clientId}`}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
