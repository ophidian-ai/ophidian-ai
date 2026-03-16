"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Users,
  FolderKanban,
  FileSignature,
  DollarSign,
  AlertTriangle,
  MessageSquare,
  Plus,
  Activity,
} from "lucide-react";
import type {
  Client,
  Project,
  Proposal,
  Payment,
  ContentRequest,
} from "@/lib/supabase/types";

interface Stats {
  totalClients: number;
  activeProjects: number;
  pendingProposals: number;
  outstandingInvoices: number;
  outstandingAmount: number;
}

interface Alert {
  type: "overdue" | "content" | "proposal";
  message: string;
  id: string;
}

interface RecentActivity {
  type: "payment" | "content" | "proposal";
  description: string;
  date: string;
  id: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    activeProjects: 0,
    pendingProposals: 0,
    outstandingInvoices: 0,
    outstandingAmount: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchData() {
      const supabase = createClient();

      const [clientsRes, projectsRes, proposalsRes, paymentsRes, contentRes] =
        await Promise.all([
          supabase.from("clients").select("*"),
          supabase.from("projects").select("*").eq("status", "active"),
          supabase.from("proposals").select("*"),
          supabase.from("payments").select("*"),
          supabase.from("content_requests").select("*"),
        ]);

      const clients = (clientsRes.data ?? []) as Client[];
      const projects = (projectsRes.data ?? []) as Project[];
      const proposals = (proposalsRes.data ?? []) as Proposal[];
      const payments = (paymentsRes.data ?? []) as Payment[];
      const contentRequests = (contentRes.data ?? []) as ContentRequest[];

      // Stats
      const pendingProposals = proposals.filter(
        (p) => p.status === "sent"
      ).length;
      const outstandingPayments = payments.filter(
        (p) => p.status === "pending" || p.status === "overdue"
      );
      const outstandingAmount = outstandingPayments.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      setStats({
        totalClients: clients.length,
        activeProjects: projects.length,
        pendingProposals,
        outstandingInvoices: outstandingPayments.length,
        outstandingAmount,
      });

      // Alerts
      const newAlerts: Alert[] = [];

      payments
        .filter((p) => p.status === "overdue")
        .forEach((p) => {
          newAlerts.push({
            type: "overdue",
            message: `Overdue payment: $${p.amount.toLocaleString()} (${p.milestone_label})`,
            id: p.id,
          });
        });

      contentRequests
        .filter((c) => c.status === "pending")
        .forEach((c) => {
          newAlerts.push({
            type: "content",
            message: `Pending content request: ${c.subject}`,
            id: c.id,
          });
        });

      proposals
        .filter((p) => p.status === "sent")
        .forEach((p) => {
          const title =
            (p.content as Record<string, unknown>)?.title ?? "Untitled";
          newAlerts.push({
            type: "proposal",
            message: `Proposal awaiting response: ${title}`,
            id: p.id,
          });
        });

      setAlerts(newAlerts.slice(0, 10));

      // Recent activity (last 5 items across all types, sorted by date)
      const activities: RecentActivity[] = [];

      payments
        .filter((p) => p.paid_at)
        .forEach((p) => {
          activities.push({
            type: "payment",
            description: `Payment received: $${p.amount.toLocaleString()}`,
            date: p.paid_at!,
            id: p.id,
          });
        });

      contentRequests.forEach((c) => {
        activities.push({
          type: "content",
          description: `Content request: ${c.subject}`,
          date: c.created_at,
          id: c.id,
        });
      });

      proposals.forEach((p) => {
        const title =
          (p.content as Record<string, unknown>)?.title ?? "Untitled";
        activities.push({
          type: "proposal",
          description: `Proposal: ${title} (${p.status})`,
          date: p.created_at,
          id: p.id,
        });
      });

      activities.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentActivity(activities.slice(0, 5));

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

  const statCards = [
    {
      label: "Total Clients",
      value: stats.totalClients,
      icon: Users,
      color: "#C4A265",
    },
    {
      label: "Active Projects",
      value: stats.activeProjects,
      icon: FolderKanban,
      color: "#7A9E7E",
    },
    {
      label: "Pending Proposals",
      value: stats.pendingProposals,
      icon: FileSignature,
      color: "#D4B87A",
    },
    {
      label: "Outstanding Invoices",
      value: `${stats.outstandingInvoices} ($${stats.outstandingAmount.toLocaleString()})`,
      icon: DollarSign,
      color: "#FF6B6B",
    },
  ];

  const alertIcons: Record<string, typeof AlertTriangle> = {
    overdue: AlertTriangle,
    content: MessageSquare,
    proposal: FileSignature,
  };

  const alertColors: Record<string, string> = {
    overdue: "text-red-400",
    content: "text-yellow-400",
    proposal: "text-teal-400",
  };

  const activityIcons: Record<string, typeof Activity> = {
    payment: DollarSign,
    content: MessageSquare,
    proposal: FileSignature,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            Overview of clients, projects, and revenue
          </p>
        </div>
        <div className="flex gap-3">
          <GlassButton size="sm" href="/dashboard/admin/clients/new">
            <span className="flex items-center gap-2">
              <Plus size={16} />
              Add Client
            </span>
          </GlassButton>
          <GlassButton size="sm" href="/dashboard/admin/clients">
            <span className="flex items-center gap-2">
              <Users size={16} />
              View All Clients
            </span>
          </GlassButton>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-yellow-400" />
            <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
          </div>
          {alerts.length === 0 ? (
            <p className="text-foreground-muted text-sm">
              No active alerts. All clear.
            </p>
          ) : (
            <ul className="space-y-3">
              {alerts.map((alert) => {
                const Icon = alertIcons[alert.type] ?? AlertTriangle;
                return (
                  <li key={alert.id} className="flex items-start gap-3">
                    <Icon
                      size={16}
                      className={`mt-0.5 ${alertColors[alert.type] ?? "text-foreground-muted"}`}
                    />
                    <span className="text-sm text-foreground">
                      {alert.message}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </GlowCard>

        {/* Recent Activity */}
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Recent Activity
            </h2>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-foreground-muted text-sm">
              No recent activity to display.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((item) => {
                const Icon = activityIcons[item.type] ?? Activity;
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <Icon
                      size={16}
                      className="mt-0.5 text-foreground-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {item.description}
                      </p>
                      <p className="text-xs text-foreground-muted mt-0.5">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </GlowCard>
      </div>
    </div>
  );
}
