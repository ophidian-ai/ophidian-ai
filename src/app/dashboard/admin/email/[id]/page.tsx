"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  ArrowLeft,
  Mail,
  Users,
  BarChart3,
  Activity,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import type { EmailConfig, EmailCampaign, EmailSequence } from "@/lib/supabase/email-types";

interface ConfigWithClient extends EmailConfig {
  clients: { company_name: string } | null;
}

interface EmailStats {
  contact_count: number;
  campaign_count: number;
  open_rate: number;
  click_rate: number;
}

interface DetailData {
  config: ConfigWithClient;
  stats: EmailStats;
  recentCampaigns: EmailCampaign[];
  activeSequences: EmailSequence[];
}

const TIER_COLORS: Record<string, string> = {
  essentials: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  growth: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

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

export default function EmailConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { role } = useDashboard();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchDetail() {
      const [configRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/email/configs/${id}`),
        fetch(`/api/admin/email/analytics/${id}`),
      ]);

      if (configRes.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (configRes.ok) {
        const configData = await configRes.json();
        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : {};

        setData({
          config: configData.config,
          stats: analyticsData.stats ?? {
            contact_count: 0,
            campaign_count: 0,
            open_rate: 0,
            click_rate: 0,
          },
          recentCampaigns: analyticsData.recentCampaigns ?? [],
          activeSequences: analyticsData.activeSequences ?? [],
        });
      }

      setLoading(false);
    }

    fetchDetail();
  }, [id, role, router]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/email/configs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard/admin/email");
      }
    } finally {
      setDeleting(false);
    }
  }

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-foreground-muted">Config not found.</p>
        <Link href="/dashboard/admin/email" className="text-primary text-sm hover:underline">
          Back to Email Marketing
        </Link>
      </div>
    );
  }

  const { config, stats, recentCampaigns, activeSequences } = data;

  const statCards = [
    {
      label: "Contacts",
      value: stats.contact_count.toLocaleString(),
      sub: `/ ${config.max_contacts.toLocaleString()} max`,
      icon: Users,
      color: "#2D8CFF",
    },
    {
      label: "Campaigns This Month",
      value: config.campaigns_this_month.toString(),
      sub: `/ ${config.monthly_send_limit.toLocaleString()} sends`,
      icon: Mail,
      color: "#00E67A",
    },
    {
      label: "Open Rate",
      value: pct(stats.open_rate),
      sub: "all campaigns",
      icon: BarChart3,
      color: "#A78BFA",
    },
    {
      label: "Click Rate",
      value: pct(stats.click_rate),
      sub: "all campaigns",
      icon: Activity,
      color: "#9B8EC4",
    },
  ];

  return (
    <div className="space-y-6">
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
            <p className="text-foreground-muted text-sm mt-0.5">
              Created {formatDate(config.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-400">Are you sure?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-foreground-muted border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
          <GlassButton size="sm" href={`/dashboard/admin/email/campaigns/new`}>
            <span className="flex items-center gap-2">
              <Plus size={16} />
              New Campaign
            </span>
          </GlassButton>
          <GlassButton size="sm" href={`/dashboard/admin/email/sequences/new`}>
            <span className="flex items-center gap-2">
              <Plus size={16} />
              New Sequence
            </span>
          </GlassButton>
        </div>
      </div>

      {/* Config Info Card */}
      <GlowCard className="p-5">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
          Configuration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              Sending Domain
            </p>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-mono">{config.sending_domain}</span>
              {config.sending_domain_verified ? (
                <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30">
                  <CheckCircle size={11} />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                  <Clock size={11} />
                  Pending
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              From
            </p>
            <p className="text-foreground">
              {config.from_name} &lt;{config.from_email}&gt;
            </p>
          </div>
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              Monthly Send Limit
            </p>
            <p className="text-foreground">
              {config.sends_this_month.toLocaleString()} / {config.monthly_send_limit.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              Max Active Sequences
            </p>
            <p className="text-foreground">{config.max_active_sequences}</p>
          </div>
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              Tier
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                TIER_COLORS[config.tier] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"
              }`}
            >
              {config.tier}
            </span>
          </div>
        </div>
      </GlowCard>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <GlowCard key={card.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
                <p className="text-xs text-foreground-dim mt-0.5">{card.sub}</p>
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

      {/* Recent Campaigns & Active Sequences */}
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
                    <p className="text-xs text-foreground-muted mt-0.5">
                      {campaign.scheduled_at
                        ? formatDate(campaign.scheduled_at)
                        : formatDate(campaign.created_at)}
                    </p>
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
    </div>
  );
}
