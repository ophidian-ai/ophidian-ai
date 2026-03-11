"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Plus, AlertCircle } from "lucide-react";
import type { Proposal, Client, ProposalStatus, ServiceType } from "@/lib/supabase/types";

type FilterType = "all" | ProposalStatus;

interface ProposalWithClient extends Proposal {
  clients: Pick<Client, "company_name" | "contact_name" | "contact_email"> | null;
  service_type?: ServiceType | null;
}

const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  sent: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  revision_requested: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved: "bg-green-500/15 text-green-400 border-green-500/30",
  declined: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  revision_requested: "Revision Requested",
  approved: "Approved",
  declined: "Declined",
};

const SERVICE_LABELS: Record<ServiceType, string> = {
  web_starter: "Web Starter",
  web_professional: "Web Professional",
  web_ecommerce: "Web E-Commerce",
  seo_cleanup: "SEO Cleanup",
  seo_growth: "SEO Growth",
  maintenance: "Maintenance",
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function AdminProposalsPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [proposals, setProposals] = useState<ProposalWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchProposals() {
      const res = await fetch("/api/admin/proposals");
      if (res.ok) {
        const data = await res.json();
        setProposals(data ?? []);
      }
      setLoading(false);
    }

    fetchProposals();
  }, [role, router]);

  const filteredProposals = useMemo(() => {
    if (filter === "all") return proposals;
    return proposals.filter((p) => p.status === filter);
  }, [proposals, filter]);

  const revisionCount = useMemo(
    () => proposals.filter((p) => p.status === "revision_requested").length,
    [proposals]
  );

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Revision Requested", value: "revision_requested" },
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
              {revisionCount > 0 && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full text-xs font-medium">
                  <AlertCircle size={12} />
                  {revisionCount} revision{revisionCount !== 1 ? "s" : ""} requested
                </span>
              )}
            </div>
            <p className="text-foreground-muted text-sm mt-1">
              {proposals.length} total proposal{proposals.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/admin/proposals/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary/15 text-primary border border-primary/30 rounded-lg text-sm font-medium hover:bg-primary/25 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          New Proposal
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === f.value
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-foreground-muted hover:text-foreground border border-white/10 hover:border-white/20"
            }`}
          >
            {f.label}
            {f.value === "revision_requested" && revisionCount > 0 && (
              <span className="ml-1.5 w-4 h-4 inline-flex items-center justify-center bg-amber-500/30 text-amber-400 rounded-full text-xs">
                {revisionCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Proposals Table */}
      <GlowCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Client
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Service
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Sent Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-foreground-muted text-sm"
                  >
                    No proposals found.
                  </td>
                </tr>
              ) : (
                filteredProposals.map((proposal) => {
                  const content = proposal.content as Record<string, unknown>;
                  const totalAmount = proposal.payment_schedule.reduce(
                    (sum, item) => sum + item.amount,
                    0
                  );
                  const serviceType = (content?.serviceType as ServiceType) ?? proposal.service_type ?? null;

                  return (
                    <tr
                      key={proposal.id}
                      onClick={() => router.push(`/dashboard/admin/proposals/${proposal.id}`)}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {proposal.clients?.company_name ?? "Unknown"}
                          </p>
                          {proposal.clients?.contact_name && (
                            <p className="text-xs text-foreground-muted mt-0.5">
                              {proposal.clients.contact_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">
                        {serviceType ? SERVICE_LABELS[serviceType] : "-"}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-foreground">
                        {totalAmount > 0 ? formatCurrency(totalAmount) : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[proposal.status]}`}
                        >
                          {STATUS_LABELS[proposal.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground-muted">
                        {proposal.sent_at
                          ? new Date(proposal.sent_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground-muted">
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </div>
  );
}
