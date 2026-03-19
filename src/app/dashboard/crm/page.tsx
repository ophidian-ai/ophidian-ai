"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { DollarSign, Target, TrendingUp, Users } from "lucide-react";

interface DealRow {
  id: string;
  pipeline_id: string;
  title: string;
  stage: string;
  value: number | null;
  probability: number;
  won_at: string | null;
  lost_at: string | null;
  created_at: string;
}

interface ContactRow {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  created_at: string;
}

interface PipelineRow {
  id: string;
  name: string;
  stages: { name: string; probability: number }[];
  is_default: boolean;
}

const STAGE_COLORS: Record<string, string> = {
  Lead: "bg-blue-500/20 text-blue-300",
  Contacted: "bg-cyan-500/20 text-cyan-300",
  Qualified: "bg-yellow-500/20 text-yellow-300",
  Proposal: "bg-orange-500/20 text-orange-300",
  Negotiation: "bg-purple-500/20 text-purple-300",
  Won: "bg-green-500/20 text-green-300",
  Lost: "bg-red-500/20 text-red-300",
};

export default function ClientCrmPage() {
  const router = useRouter();
  const { clientId } = useDashboard();
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [pipelines, setPipelines] = useState<PipelineRow[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    async function fetchData() {
      // Client uses admin endpoints filtered to their own config
      // We use the admin CRM endpoints (server checks auth role)
      const [dealsRes, contactsRes, pipelinesRes] = await Promise.all([
        fetch("/api/admin/crm/deals"),
        fetch("/api/admin/crm/configs"),
        fetch("/api/admin/crm/pipelines"),
      ]);

      if (!dealsRes.ok) {
        setError("Failed to load CRM data.");
        setLoading(false);
        return;
      }

      const dealsData = await dealsRes.json();
      setDeals(dealsData.deals ?? []);

      if (pipelinesRes.ok) {
        const d = await pipelinesRes.json();
        const pls: PipelineRow[] = d.pipelines ?? [];
        setPipelines(pls);
        const defaultPl = pls.find((p) => p.is_default) ?? pls[0];
        if (defaultPl) setSelectedPipelineId(defaultPl.id);
      }

      setLoading(false);
    }

    fetchData();
  }, [clientId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-foreground-muted">{error}</div>
    );
  }

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);
  const pipelineDeals = deals.filter((d) => d.pipeline_id === selectedPipelineId);

  const totalValue = pipelineDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const wonDeals = pipelineDeals.filter((d) => d.won_at);
  const closedDeals = pipelineDeals.filter((d) => d.won_at || d.lost_at);
  const winRate = closedDeals.length > 0
    ? Math.round((wonDeals.length / closedDeals.length) * 100)
    : null;

  // Group deals by stage
  const dealsByStage: Record<string, DealRow[]> = {};
  if (selectedPipeline) {
    for (const stage of selectedPipeline.stages) {
      dealsByStage[stage.name] = pipelineDeals.filter((d) => d.stage === stage.name);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">CRM</h1>
        <p className="text-foreground-muted text-sm mt-1">Your pipeline and contacts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlowCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Target size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Deals</p>
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
        <GlowCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Users size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Contacts</p>
              <p className="text-xl font-bold text-foreground">{contacts.length}</p>
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Pipeline selector */}
      {pipelines.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-foreground-muted">Pipeline:</label>
          <select
            value={selectedPipelineId}
            onChange={(e) => setSelectedPipelineId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pipeline view */}
      {selectedPipeline && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">
            {selectedPipeline.name}
          </h2>
          <GlowCard className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10">
                  {selectedPipeline.stages.map((stage) => (
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
                  {selectedPipeline.stages.map((stage) => (
                    <td
                      key={stage.name}
                      className="px-4 py-3 align-top border-r border-white/5 last:border-r-0"
                    >
                      <div className="space-y-2 min-w-[130px]">
                        {(dealsByStage[stage.name] ?? []).map((deal) => (
                          <div
                            key={deal.id}
                            className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5"
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
                          <p className="text-xs text-foreground-dim italic">—</p>
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

      {/* Contact list */}
      {contacts.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Contacts</h2>
          <GlowCard className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Source</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Added</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-white/5">
                    <td className="px-5 py-3 text-sm text-foreground">
                      {contact.name ?? <span className="text-foreground-dim italic">No name</span>}
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground-muted">{contact.email}</td>
                    <td className="px-5 py-3 text-sm text-foreground-muted capitalize">{contact.source ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-foreground-muted">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlowCard>
        </div>
      )}
    </div>
  );
}
