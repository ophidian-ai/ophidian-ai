"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { GlassButton } from "@/components/ui/glass-button";
import { createClient } from "@/lib/supabase/client";
import type { Proposal, ProposalStatus, PaymentMilestone } from "@/lib/supabase/types";

const STATUS_STYLES: Record<ProposalStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  sent: { label: "Awaiting Review", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  revision_requested: { label: "Revision Requested", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  approved: { label: "Approved", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  declined: { label: "Declined", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const MILESTONE_LABELS: Record<PaymentMilestone, string> = {
  deposit: "Deposit",
  midpoint: "Midpoint",
  final: "Final",
  monthly: "Monthly",
};

export default function ProposalsPage() {
  const { clientId } = useDashboard();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;

    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase
        .from("proposals")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      setProposals(data ?? []);
      setLoading(false);
    }

    fetchData();
  }, [clientId]);

  async function handleAction(proposalId: string, action: "approved" | "declined") {
    setActionLoading(proposalId);

    try {
      const res = await fetch(`/api/proposals/${proposalId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update proposal");
        return;
      }

      const updated = await res.json();
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? updated : p))
      );
    } finally {
      setActionLoading(null);
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass rounded-xl border border-primary/10 p-6 animate-pulse">
              <div className="h-5 w-48 bg-white/5 rounded" />
              <div className="h-4 w-32 bg-white/5 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Proposals</h1>

      {proposals.length === 0 ? (
        <div className="glass rounded-xl border border-primary/10 p-12 text-center">
          <div className="text-foreground-dim text-4xl mb-4">--</div>
          <p className="text-foreground-dim">No proposals yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const style = STATUS_STYLES[proposal.status];
            const content = proposal.content as Record<string, unknown>;
            const title = (content?.title as string) || "Proposal";
            const isExpanded = expandedId === proposal.id;

            return (
              <div
                key={proposal.id}
                className="glass rounded-xl border border-primary/10 overflow-hidden"
              >
                {/* Header */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                  className="w-full p-6 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground">{title}</h3>
                    {proposal.sent_at && (
                      <p className="text-xs text-foreground-dim mt-1">
                        Sent {new Date(proposal.sent_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${style.className}`}
                    >
                      {style.label}
                    </span>
                    <svg
                      className={`w-4 h-4 text-foreground-dim transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-6 space-y-6">
                    {/* Proposal Content */}
                    {typeof content?.description === "string" && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground-dim mb-2">Description</h4>
                        <p className="text-foreground text-sm whitespace-pre-wrap">
                          {content.description}
                        </p>
                      </div>
                    )}

                    {typeof content?.scope === "string" && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground-dim mb-2">Scope</h4>
                        <p className="text-foreground text-sm whitespace-pre-wrap">
                          {content.scope}
                        </p>
                      </div>
                    )}

                    {typeof content?.timeline === "string" && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground-dim mb-2">Timeline</h4>
                        <p className="text-foreground text-sm">{content.timeline}</p>
                      </div>
                    )}

                    {typeof content?.total === "number" && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground-dim mb-2">Total</h4>
                        <p className="text-foreground text-lg font-bold">
                          {formatCurrency(content.total)}
                        </p>
                      </div>
                    )}

                    {/* Payment Schedule */}
                    {proposal.payment_schedule && proposal.payment_schedule.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground-dim mb-2">
                          Payment Schedule
                        </h4>
                        <div className="space-y-2">
                          {proposal.payment_schedule.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                            >
                              <span className="text-sm text-foreground">
                                {MILESTONE_LABELS[item.milestone] ?? item.milestone} ({item.percentage}%)
                              </span>
                              <span className="text-sm font-medium text-foreground">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Approval Status */}
                    {proposal.status === "approved" && proposal.approved_at && (
                      <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                        Approved on {new Date(proposal.approved_at).toLocaleDateString()}
                      </div>
                    )}

                    {proposal.status === "declined" && (
                      <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        Declined
                      </div>
                    )}

                    {/* Action Buttons */}
                    {proposal.status === "sent" && (
                      <div className="flex gap-3 pt-2">
                        <GlassButton
                          onClick={() => handleAction(proposal.id, "approved")}
                          disabled={actionLoading === proposal.id}
                        >
                          {actionLoading === proposal.id ? "Processing..." : "Approve"}
                        </GlassButton>
                        <button
                          type="button"
                          onClick={() => handleAction(proposal.id, "declined")}
                          disabled={actionLoading === proposal.id}
                          className="px-6 py-3.5 rounded-full text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
