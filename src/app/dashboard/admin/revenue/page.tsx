"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { DollarSign, TrendingUp, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type {
  Payment,
  ClientService,
  ServiceType,
} from "@/lib/supabase/types";

const SERVICE_LABELS: Record<ServiceType, string> = {
  web_starter: "Web Starter",
  web_professional: "Web Pro",
  web_ecommerce: "Web E-Commerce",
  seo_cleanup: "SEO Cleanup",
  seo_growth: "SEO Growth",
  maintenance: "Maintenance",
  social_media: "Social Media",
};

const PIE_COLORS = [
  "#C4A265",
  "#7A9E7E",
  "#D4B87A",
  "#A88B52",
  "#5C7F61",
  "#64748B",
];

export default function AdminRevenuePage() {
  const router = useRouter();
  const { role } = useDashboard();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<ClientService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchData() {
      const supabase = createClient();

      const [paymentsRes, servicesRes] = await Promise.all([
        supabase.from("payments").select("*"),
        supabase.from("client_services").select("*"),
      ]);

      setPayments((paymentsRes.data ?? []) as Payment[]);
      setServices((servicesRes.data ?? []) as ClientService[]);
      setLoading(false);
    }

    fetchData();
  }, [role, router]);

  // Computed stats
  const totalRevenue = useMemo(
    () =>
      payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const outstanding = useMemo(
    () =>
      payments
        .filter((p) => p.status === "pending" || p.status === "overdue")
        .reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const mrr = useMemo(
    () =>
      services
        .filter((s) => s.status === "active" && s.monthly_amount)
        .reduce((sum, s) => sum + (s.monthly_amount ?? 0), 0),
    [services]
  );

  // Monthly revenue chart data
  const monthlyData = useMemo(() => {
    const paidPayments = payments.filter(
      (p) => p.status === "paid" && p.paid_at
    );
    const byMonth: Record<string, number> = {};

    paidPayments.forEach((p) => {
      const date = new Date(p.paid_at!);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] ?? 0) + p.amount;
    });

    const sorted = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        amount,
      }));

    return sorted;
  }, [payments]);

  // Service type breakdown
  const serviceBreakdown = useMemo(() => {
    const paidPayments = payments.filter((p) => p.status === "paid");
    const byService: Record<string, number> = {};

    paidPayments.forEach((p) => {
      // Find the associated service via client_service_id
      const service = services.find((s) => s.id === p.client_service_id);
      const type = service?.service_type ?? "unknown";
      const label = SERVICE_LABELS[type as ServiceType] ?? "Other";
      byService[label] = (byService[label] ?? 0) + p.amount;
    });

    return Object.entries(byService).map(([name, value]) => ({ name, value }));
  }, [payments, services]);

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "#C4A265",
    },
    {
      label: "Outstanding",
      value: `$${outstanding.toLocaleString()}`,
      icon: Clock,
      color: "#FF6B6B",
    },
    {
      label: "Monthly Recurring Revenue",
      value: `$${mrr.toLocaleString()}/mo`,
      icon: TrendingUp,
      color: "#7A9E7E",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Revenue</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Financial overview and revenue analytics
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <GlowCard key={card.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {card.value}
                </p>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon size={20} style={{ color: card.color }} />
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <GlowCard className="p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Revenue by Month
          </h2>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-foreground-muted text-sm">
              No payment data to display yet.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickFormatter={(v) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F1F14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#C4A265"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlowCard>

        {/* Breakdown by Service */}
        <GlowCard className="p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Revenue by Service Type
          </h2>
          {serviceBreakdown.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-foreground-muted text-sm">
              No payment data to display yet.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {serviceBreakdown.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F1F14",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "#9CA3AF" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlowCard>
      </div>
    </div>
  );
}
