"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ContactRound, Plus, ExternalLink, TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";

interface CrmConfigRow {
  id: string;
  tier: string;
  active: boolean;
  max_pipelines: number;
  api_access: string;
  clients: { company_name: string; slug: string } | null;
}

interface DealRow {
  id: string;
  config_id: string;
  pipeline_id: string;
  title: string;
  stage: string;
  value: number | null;
  probability: number;
  won_at: string | null;
  lost_at: string | null;
}

interface PipelineRow {
  id: string;
  config_id: string;
  name: string;
  stages: { name: string; probability: number; color?: string }[];
  is_default: boolean;
}

const TIER_COLORS: Record<string, string> = {
  essentials: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  growth: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const STAGE_COLORS: Record<string, string> = {
  Lead: "bg-blue-500/20 text-blue-300",
  Contacted: "bg-cyan-500/20 text-cyan-300",
  Qualified: "bg-yellow-500/20 text-yellow-300",
  Proposal: "bg-orange-500/20 text-orange-300",
  Negotiation: "bg-purple-500/20 text-purple-300",
  Won: "bg-green-500/20 text-green-300",
  Lost: "bg-red-500/20 text-red-300",
};

export default function AdminCrmPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [configs, setConfigs] = useState<CrmConfigRow[]>([]);
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [pipelines, setPipelines] = useState<PipelineRow[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchData() {
      const [configsRes, dealsRes, pipelinesRes] = await Promise.all([
        fetch("/api/admin/crm/configs"),
        fetch("/api/admin/crm/deals"),
        fetch("/api/admin/crm/pipelines"),
      ]);

      if (configsRes.ok) {
        const d = await configsRes.json();
        setConfigs(d.configs ?? []);
      }
      if (dealsRes.ok) {
        const d = await dealsRes.json();
        setDeals(d.deals ?? []);
      }
      if (pipelinesRes.ok) {
        const d = await pipelinesRes.json();
        const pl: PipelineRow[] = d.pipelines ?? [];
        setPipelines(pl);
        if (pl.length > 0 && !selectedPipelineId) {
          setSelectedPipelineId(pl[0].id);
        }
      }
      setLoading(false);
    }

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, router]);

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);
  const pipelineDeals = deals.filter((d) => d.pipeline_id === selectedPipelineId);

  const totalValue = pipelineDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const weightedValue = pipelineDeals.reduce(
    (sum, d) => sum + (d.value ?? 0) * (d.probability / 100),
    0
  );
  const wonDeals = pipelineDeals.filter((d) => d.won_at).length;
  const closedDeals = pipelineDeals.filter((d) => d.won_at || d.lost_at).length;
  const winRate = closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : null;

  // Group deals by stage
  const dealsByStage: Record<string, DealRow[]> = {};
  if (selectedPipeline) {
    for (const stage of selectedPipeline.stages as { name: string }[]) {
      dealsByStage[stage.name] = pipelineDeals.filter((d) => d.stage === stage.name);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CRM</h1>
          <p className="text-foreground-muted text-sm mt-1">
            {configs.length} config{configs.length !== 1 ? "s" : ""} &middot; {deals.length} total deals
          </p>
        </div>
        <GlassButton size="sm" href="/dashboard/admin/crm/new">
          <span className="flex items-center gap-2">
            <Plus size={16} />
            New Config
          </span>
        </GlassButton>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Target size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Pipeline Deals</p>
              <p className="text-xl font-bold text-foreground">{pipelineDeals.length}</p>
            </div>
          </div>
        </GlowCard>
        <GlowCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <DollarSign size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Pipeline Value</p>
              <p className="text-xl font-bold text-foreground">
                ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </GlowCard>
        <GlowCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <BarChart3 size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Weighted Value</p>
              <p className="text-xl font-bold text-foreground">
                ${Math.round(weightedValue).toLocaleString()}
              </p>
            </div>
          </div>
        </GlowCard>
        <GlowCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Win Rate</p>
              <p className="text-xl font-bold text-foreground">
                {winRate !== null ? `${winRate}%` : "—"}
              </p>
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Pipeline selector + Kanban */}
      {pipelines.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-foreground-muted">Pipeline:</label>
            <select
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.is_default ? " (default)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Kanban-style stage table */}
          <GlowCard className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10">
                  {selectedPipeline &&
                    (selectedPipeline.stages as { name: string }[]).map((stage) => (
                      <th
                        key={stage.name}
                        className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider"
                      >
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${
                            STAGE_COLORS[stage.name] ?? "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {stage.name}
                          <span className="font-normal opacity-60">
                            ({(dealsByStage[stage.name] ?? []).length})
                          </span>
                        </span>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {selectedPipeline &&
                    (selectedPipeline.stages as { name: string }[]).map((stage) => (
                      <td
                        key={stage.name}
                        className="px-4 py-3 align-top border-r border-white/5 last:border-r-0"
                      >
                        <div className="space-y-2 min-w-[140px]">
                          {(dealsByStage[stage.name] ?? []).map((deal) => (
                            <div
                              key={deal.id}
                              className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
                            >
                              <p className="text-xs font-medium text-foreground leading-snug">
                                {deal.title}
                              </p>
                              {deal.value != null && (
                                <p className="text-xs text-foreground-muted mt-1">
                                  ${deal.value.toLocaleString()}
                                </p>
                              )}
                            </div>
                          ))}
                          {(dealsByStage[stage.name] ?? []).length === 0 && (
                            <p className="text-xs text-foreground-dim italic">Empty</p>
                          )}
                        </div>
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </GlowCard>
        </div>
      )}

      {/* Configs table */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Client Configs</h2>
        <GlowCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Tier</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">API Access</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                  <th className="w-16" />
                </tr>
              </thead>
              <tbody>
                {configs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-foreground-muted text-sm">
                      <div className="flex flex-col items-center gap-3">
                        <ContactRound size={32} className="text-foreground-dim" />
                        <span>No CRM configs yet.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  configs.map((config) => (
                    <tr
                      key={config.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-foreground">
                        {config.clients?.company_name ?? (
                          <span className="text-foreground-muted italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                            TIER_COLORS[config.tier] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {config.tier}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground-muted capitalize">
                        {config.api_access}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          config.active
                            ? "bg-green-500/15 text-green-400 border-green-500/30"
                            : "bg-red-500/15 text-red-400 border-red-500/30"
                        }`}>
                          {config.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/admin/crm/${config.id}`}
                          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
