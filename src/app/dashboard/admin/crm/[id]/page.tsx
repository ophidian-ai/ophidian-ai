"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowLeft, Plus, BarChart3, DollarSign, TrendingUp, Zap, Trash2 } from "lucide-react";

interface CrmConfigDetail {
  id: string;
  tier: string;
  active: boolean;
  max_pipelines: number;
  api_access: string;
  created_at: string;
  clients: { company_name: string; slug: string } | null;
}

interface PipelineRow {
  id: string;
  name: string;
  stages: { name: string; probability: number }[];
  is_default: boolean;
}

interface AnalyticsData {
  deal_count: number;
  total_value: number;
  weighted_value: number;
  win_rate: number | null;
  by_stage: Record<string, { count: number; total_value: number }>;
}

interface AutomationRow {
  id: string;
  name: string;
  trigger_type: string;
  action_type: string;
  active: boolean;
}

interface ActivityRow {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

export default function AdminCrmConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { role } = useDashboard();

  const [config, setConfig] = useState<CrmConfigDetail | null>(null);
  const [pipelines, setPipelines] = useState<PipelineRow[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, AnalyticsData>>({});
  const [automations, setAutomations] = useState<AutomationRow[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchData() {
      const [configsRes, pipelinesRes, automationsRes] = await Promise.all([
        fetch("/api/admin/crm/configs"),
        fetch(`/api/admin/crm/pipelines?config_id=${id}`),
        fetch(`/api/admin/crm/automations?config_id=${id}`),
      ]);

      if (configsRes.ok) {
        const d = await configsRes.json();
        const found = (d.configs ?? []).find((c: CrmConfigDetail) => c.id === id);
        if (found) setConfig(found);
      }

      let pls: PipelineRow[] = [];
      if (pipelinesRes.ok) {
        const d = await pipelinesRes.json();
        pls = d.pipelines ?? [];
        setPipelines(pls);
      }

      if (automationsRes.ok) {
        const d = await automationsRes.json();
        setAutomations(d.automations ?? []);
      }

      // Fetch analytics for each pipeline
      const analyticsResults: Record<string, AnalyticsData> = {};
      await Promise.all(
        pls.map(async (pl) => {
          const res = await fetch(`/api/admin/crm/analytics/${pl.id}`);
          if (res.ok) {
            analyticsResults[pl.id] = await res.json();
          }
        })
      );
      setAnalytics(analyticsResults);

      // Fetch recent deals to get activities indirectly via config deals
      // We show recent activities across the config -- fetch deals then pick first contact
      const dealsRes = await fetch(`/api/admin/crm/deals?config_id=${id}&limit=5`);
      if (dealsRes.ok) {
        const d = await dealsRes.json();
        const firstDeal = (d.deals ?? [])[0];
        if (firstDeal?.contact_id) {
          const timelineRes = await fetch(
            `/api/admin/crm/contacts/${firstDeal.contact_id}/timeline?limit=10`
          );
          if (timelineRes.ok) {
            const td = await timelineRes.json();
            setActivities(td.activities ?? []);
          }
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [id, role, router]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/crm/configs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard/admin/crm");
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

  if (!config) {
    return (
      <div className="text-center py-16 text-foreground-muted">
        Config not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/crm"
          className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {config.clients?.company_name ?? "CRM Config"}
          </h1>
          <p className="text-foreground-muted text-sm mt-0.5 capitalize">
            {config.tier} tier &middot; API: {config.api_access}
          </p>
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
          <GlassButton size="sm" href="/dashboard/admin/crm/automations/new">
            <span className="flex items-center gap-2">
              <Plus size={16} />
              Add Automation
            </span>
          </GlassButton>
        </div>
      </div>

      {/* Pipeline stats */}
      {pipelines.map((pipeline) => {
        const stats = analytics[pipeline.id];
        return (
          <div key={pipeline.id}>
            <h2 className="text-base font-semibold text-foreground mb-3">
              {pipeline.name}{pipeline.is_default ? " (default)" : ""}
            </h2>
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <GlowCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BarChart3 size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-muted">Deals</p>
                      <p className="text-lg font-bold text-foreground">{stats.deal_count}</p>
                    </div>
                  </div>
                </GlowCard>
                <GlowCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <DollarSign size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-muted">Total Value</p>
                      <p className="text-lg font-bold text-foreground">
                        ${stats.total_value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </GlowCard>
                <GlowCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <DollarSign size={16} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-muted">Weighted</p>
                      <p className="text-lg font-bold text-foreground">
                        ${Math.round(stats.weighted_value).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </GlowCard>
                <GlowCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <TrendingUp size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-muted">Win Rate</p>
                      <p className="text-lg font-bold text-foreground">
                        {stats.win_rate !== null ? `${stats.win_rate}%` : "—"}
                      </p>
                    </div>
                  </div>
                </GlowCard>
              </div>
            )}

            {/* Stage breakdown */}
            <GlowCard className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Stage</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Probability</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Deals</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.stages.map((stage) => {
                    const stageData = stats?.by_stage?.[stage.name];
                    return (
                      <tr key={stage.name} className="border-b border-white/5">
                        <td className="px-5 py-3 text-sm text-foreground">{stage.name}</td>
                        <td className="px-5 py-3 text-sm text-foreground-muted">{stage.probability}%</td>
                        <td className="px-5 py-3 text-sm text-foreground-muted">{stageData?.count ?? 0}</td>
                        <td className="px-5 py-3 text-sm text-foreground-muted">
                          ${(stageData?.total_value ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </GlowCard>
          </div>
        );
      })}

      {/* Automations */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          Automations
        </h2>
        <GlowCard className="overflow-hidden">
          {automations.length === 0 ? (
            <div className="px-5 py-8 text-center text-foreground-muted text-sm">
              No automations configured.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Trigger</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Action</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {automations.map((auto) => (
                  <tr key={auto.id} className="border-b border-white/5">
                    <td className="px-5 py-3 text-sm text-foreground">{auto.name}</td>
                    <td className="px-5 py-3 text-sm text-foreground-muted font-mono">{auto.trigger_type}</td>
                    <td className="px-5 py-3 text-sm text-foreground-muted font-mono">{auto.action_type}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        auto.active
                          ? "bg-green-500/15 text-green-400 border-green-500/30"
                          : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                      }`}>
                        {auto.active ? "Active" : "Paused"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlowCard>
      </div>

      {/* Recent activities */}
      {activities.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Recent Activities</h2>
          <GlowCard className="divide-y divide-white/5">
            {activities.map((activity) => (
              <div key={activity.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-foreground-muted font-mono">{activity.type}</p>
                    <p className="text-sm text-foreground mt-0.5">{activity.description}</p>
                  </div>
                  <p className="text-xs text-foreground-dim whitespace-nowrap">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </GlowCard>
        </div>
      )}
    </div>
  );
}
