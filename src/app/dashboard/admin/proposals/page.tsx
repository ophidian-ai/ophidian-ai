"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  FileSignature,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import type { Proposal, Client, ProposalStatus } from "@/lib/supabase/types";

type FilterType = "all" | ProposalStatus;

interface ProposalWithClient extends Proposal {
  clients: Pick<Client, "company_name"> | null;
}

const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  sent: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  revision_requested: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved: "bg-green-500/15 text-green-400 border-green-500/30",
  declined: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function AdminProposalsPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [proposals, setProposals] = useState<ProposalWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchProposals() {
      const supabase = createClient();
      const { data } = await supabase
        .from("proposals")
        .select("*, clients (company_name)")
        .order("created_at", { ascending: false });

      setProposals((data ?? []) as ProposalWithClient[]);
      setLoading(false);
    }

    fetchProposals();
  }, [role, router]);

  const filteredProposals = useMemo(() => {
    if (filter === "all") return proposals;
    return proposals.filter((p) => p.status === filter);
  }, [proposals, filter]);

  const handleSend = async (proposalId: string) => {
    setSending(proposalId);
    const supabase = createClient();

    const { error } = await supabase
      .from("proposals")
      .update({
        status: "sent" as ProposalStatus,
        sent_at: new Date().toISOString(),
      })
      .eq("id", proposalId);

    if (!error) {
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? { ...p, status: "sent" as ProposalStatus, sent_at: new Date().toISOString() }
            : p
        )
      );
    }

    setSending(null);
  };

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
    { label: "Approved", value: "approved" },
    { label: "Declined", value: "declined" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Proposals</h1>
        <p className="text-foreground-muted text-sm mt-1">
          {proposals.length} total proposal{proposals.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === f.value
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-foreground-muted hover:text-foreground border border-white/10 hover:border-white/20"
            }`}
          >
            {f.label}
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
                  Title
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Sent
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Total
                </th>
                <th className="w-20" />
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
                  const title = (content?.title as string) ?? "Untitled";
                  const totalAmount = proposal.payment_schedule.reduce(
                    (sum, item) => sum + item.amount,
                    0
                  );
                  const isExpanded = expandedId === proposal.id;

                  return (
                    <>
                      <tr
                        key={proposal.id}
                        onClick={() =>
                          setExpandedId(isExpanded ? null : proposal.id)
                        }
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-foreground">
                          {proposal.clients?.company_name ?? "Unknown"}
                        </td>
                        <td className="px-5 py-4 text-sm text-foreground">
                          {title}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[proposal.status]}`}
                          >
                            {proposal.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-foreground-muted">
                          {proposal.sent_at
                            ? new Date(proposal.sent_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-5 py-4 text-sm text-foreground">
                          ${totalAmount.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 flex items-center gap-2">
                          {proposal.status === "draft" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSend(proposal.id);
                              }}
                              disabled={sending === proposal.id}
                              className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors cursor-pointer"
                              title="Send proposal"
                            >
                              <Send size={14} />
                            </button>
                          )}
                          {isExpanded ? (
                            <ChevronUp
                              size={16}
                              className="text-foreground-muted"
                            />
                          ) : (
                            <ChevronDown
                              size={16}
                              className="text-foreground-muted"
                            />
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${proposal.id}-details`}>
                          <td
                            colSpan={6}
                            className="px-5 py-4 bg-surface/30 border-b border-white/5"
                          >
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-foreground-muted uppercase mb-1">
                                  Content
                                </p>
                                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                                  {JSON.stringify(content, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-foreground-muted uppercase mb-1">
                                  Payment Schedule
                                </p>
                                <div className="flex flex-wrap gap-3">
                                  {proposal.payment_schedule.map(
                                    (item, idx) => (
                                      <div
                                        key={idx}
                                        className="text-sm text-foreground bg-surface/50 border border-white/10 rounded-lg px-3 py-2"
                                      >
                                        <span className="capitalize">
                                          {item.milestone}
                                        </span>
                                        : ${item.amount.toLocaleString()} (
                                        {item.percentage}%)
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
