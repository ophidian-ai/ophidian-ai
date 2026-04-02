"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Mail, BarChart3, Activity, Users, TrendingUp } from "lucide-react";
import type { EmailCampaign, EmailSequence } from "@/lib/supabase/email-types";

interface EmailStats {
  contact_count: number;
  campaigns_this_month: number;
  open_rate: number;
  click_rate: number;
  active_sequences: number;
}

interface ClientEmailData {
  stats: EmailStats;
  recentCampaigns: EmailCampaign[];
  activeSequences: EmailSequence[];
}

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  scheduled: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  sending: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  sent: "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export default function ClientEmailPage() {
  const router = useRouter();
  const { role, clientId } = useDashboard();
  const [data, setData] = useState<ClientEmailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "admin") {
      router.replace("/dashboard/admin/email");
      return;
    }

    if (!clientId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      const res = await fetch(`/api/email/stats`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
      setLoading(false);
    }

    fetchData();
  }, [role, clientId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Mail size={32} className="text-foreground-dim" />
        <p className="text-foreground-muted text-sm">
          Email marketing is not configured for your account yet.
        </p>
      </div>
    );
  }

  const { stats, recentCampaigns, activeSequences } = data;

  const statCards = [
    {
      label: "Contacts",
      value: stats.contact_count.toLocaleString(),
      icon: Users,
      color: "#2D8CFF",
    },
    {
      label: "Campaigns This Month",
      value: stats.campaigns_this_month.toString(),
      icon: Mail,
      color: "#00E67A",
    },
    {
      label: "Open Rate",
      value: pct(stats.open_rate),
      icon: BarChart3,
      color: "#A78BFA",
    },
    {
      label: "Click Rate",
      value: pct(stats.click_rate),
      icon: TrendingUp,
      color: "#9B8EC4",
    },
    {
      label: "Active Sequences",
      value: stats.active_sequences.toString(),
      icon: Activity,
      color: "#6B9EC4",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Email Marketing</h1>
        <p className="text-foreground-muted text-sm mt-1">
          Your campaigns, sequences, and contact performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <GlowCard key={card.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
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

      {/* Campaigns & Sequences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Recent Campaigns</h2>
          </div>
          {recentCampaigns.length === 0 ? (
            <p className="text-foreground-muted text-sm">No campaigns yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentCampaigns.map((campaign) => (
                <li
                  key={campaign.id}
                  className="flex items-center justify-between pb-3 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {campaign.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-foreground-muted">
                        {campaign.scheduled_at
                          ? formatDate(campaign.scheduled_at)
                          : formatDate(campaign.created_at)}
                      </p>
                      {campaign.stats?.sent != null && (
                        <p className="text-xs text-foreground-muted">
                          {campaign.stats.sent.toLocaleString()} sent
                        </p>
                      )}
                      {campaign.stats?.opened != null && campaign.stats?.sent != null && campaign.stats.sent > 0 && (
                        <p className="text-xs text-foreground-muted">
                          {pct(campaign.stats.opened / campaign.stats.sent)} opened
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border capitalize ml-3 shrink-0 ${
                      CAMPAIGN_STATUS_COLORS[campaign.status] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"
                    }`}
                  >
                    {campaign.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlowCard>

        {/* Active Sequences */}
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Active Sequences</h2>
          </div>
          {activeSequences.length === 0 ? (
            <p className="text-foreground-muted text-sm">No active sequences.</p>
          ) : (
            <ul className="space-y-3">
              {activeSequences.map((seq) => (
                <li
                  key={seq.id}
                  className="flex items-center justify-between pb-3 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {seq.name}
                    </p>
                    <p className="text-xs text-foreground-muted mt-0.5 capitalize">
                      {seq.trigger_type.replace(/_/g, " ")} &mdash;{" "}
                      {seq.steps.length} step{seq.steps.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-green-500/15 text-green-400 border-green-500/30 ml-3 shrink-0">
                    Active
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlowCard>
      </div>

      {/* Contact Growth Placeholder */}
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Contact Growth</h2>
        </div>
        <div className="flex items-center justify-center h-32 border border-dashed border-white/10 rounded-lg">
          <p className="text-foreground-muted text-sm">
            Contact growth chart coming soon.
          </p>
        </div>
      </GlowCard>
    </div>
  );
}
