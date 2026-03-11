"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";
import type {
  Proposal,
  Client,
  ProposalStatus,
  ProposalRevision,
  ProposalContent,
  PaymentMilestone,
} from "@/lib/supabase/types";

interface ProposalWithClient extends Proposal {
  clients: Pick<Client, "company_name" | "contact_name" | "contact_email" | "phone"> | null;
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

const MILESTONE_LABELS: Record<PaymentMilestone, string> = {
  deposit: "Deposit",
  midpoint: "Midpoint",
  final: "Final",
  monthly: "Monthly",
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function AdminProposalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params.id as string;
  const { role } = useDashboard();

  const [proposal, setProposal] = useState<ProposalWithClient | null>(null);
  const [revisions, setRevisions] = useState<ProposalRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const [proposalRes, revisionsRes] = await Promise.all([
      supabase
        .from("proposals")
        .select("*, clients(company_name, contact_name, contact_email, phone)")
        .eq("id", proposalId)
        .single(),
      supabase
        .from("proposal_revisions")
        .select("*")
        .eq("proposal_id", proposalId)
        .order("requested_at", { ascending: false }),
    ]);

    setProposal(proposalRes.data as ProposalWithClient | null);
    setRevisions((revisionsRes.data ?? []) as ProposalRevision[]);
    setLoading(false);
  }, [proposalId]);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    fetchData();
  }, [role, router, fetchData]);

  const handleSend = async () => {
    if (!proposal) return;
    setSending(true);
    setSendError(null);

    const res = await fetch(`/api/admin/proposals/${proposalId}/send`, {
      method: "POST",
    });

    if (res.ok) {
      const data = await res.json();
      setProposal((prev) =>
        prev
          ? { ...prev, status: "sent", sent_at: data.sent_at ?? new Date().toISOString() }
          : prev
      );
    } else {
      const data = await res.json();
      setSendError(data.error ?? "Failed to send proposal.");
    }

    setSending(false);
  };

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-foreground-muted">Proposal not found.</p>
        <GlassButton size="sm" onClick={() => router.push("/dashboard/admin/proposals")}>
          Back to Proposals
        </GlassButton>
      </div>
    );
  }

  const content = proposal.content as Partial<ProposalContent>;
  const totalAmount = proposal.payment_schedule.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/proposals")}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} className="text-foreground-muted" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {proposal.clients?.company_name ?? "Unknown Client"}
              </h1>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[proposal.status]}`}
              >
                {STATUS_LABELS[proposal.status]}
              </span>
            </div>
            {proposal.clients?.contact_name && (
              <p className="text-foreground-muted text-sm mt-0.5">
                {proposal.clients.contact_name}
                {proposal.clients.contact_email && (
                  <> &middot; {proposal.clients.contact_email}</>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {proposal.status === "draft" && (
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/25 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send size={15} />
              {sending ? "Sending..." : "Send to Client"}
            </button>
          )}

          {proposal.status === "sent" && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm">
              <Clock size={15} />
              Waiting for client response
            </div>
          )}

          {proposal.status === "revision_requested" && (
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-medium hover:bg-amber-500/25 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send size={15} />
              {sending ? "Sending..." : "Resend to Client"}
            </button>
          )}

          {proposal.status === "approved" && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-sm">
              <CheckCircle2 size={15} />
              Approved
              {proposal.approved_at && (
                <span className="text-green-400/60">
                  &middot; {new Date(proposal.approved_at).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {proposal.status === "declined" && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm">
              <XCircle size={15} />
              Declined
            </div>
          )}
        </div>
      </div>

      {sendError && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
          {sendError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Proposal Content */}
          <GlowCard className="p-6 space-y-5">
            <h2 className="text-lg font-semibold text-foreground">Proposal Details</h2>

            {content.scope && (
              <div>
                <h3 className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
                  Scope of Work
                </h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">{content.scope}</p>
              </div>
            )}

            {content.timeline && (
              <div>
                <h3 className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
                  Timeline
                </h3>
                <p className="text-sm text-foreground">{content.timeline}</p>
              </div>
            )}

            {content.deliverables && content.deliverables.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
                  Deliverables
                </h3>
                <ul className="space-y-1">
                  {content.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-primary mt-0.5">-</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </GlowCard>

          {/* Pricing */}
          <GlowCard className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Pricing</h2>
            <div className="space-y-3">
              {content.basePrice !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Base Price</span>
                  <span className="text-foreground">{formatCurrency(content.basePrice)}</span>
                </div>
              )}

              {content.discounts && content.discounts.length > 0 && (
                <>
                  <div className="border-t border-white/5 pt-3 space-y-2">
                    <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Discounts
                    </p>
                    {content.discounts.map((d, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-foreground-muted">{d.label}</span>
                        <span className="text-red-400">-{formatCurrency(d.amount)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {content.finalPrice !== undefined && (
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-lg text-primary">
                    {formatCurrency(content.finalPrice)}
                  </span>
                </div>
              )}

              {totalAmount > 0 && content.finalPrice === undefined && (
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(totalAmount)}</span>
                </div>
              )}
            </div>
          </GlowCard>

          {/* Payment Schedule */}
          {proposal.payment_schedule.length > 0 && (
            <GlowCard className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Schedule</h2>
              <div className="space-y-2">
                {proposal.payment_schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm text-foreground">
                      {MILESTONE_LABELS[item.milestone] ?? item.milestone}
                      <span className="text-foreground-muted ml-2">({item.percentage}%)</span>
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </GlowCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <GlowCard className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-foreground-muted text-xs uppercase tracking-wider mb-0.5">
                  Created
                </dt>
                <dd className="text-foreground">
                  {new Date(proposal.created_at).toLocaleDateString()}
                </dd>
              </div>
              {proposal.sent_at && (
                <div>
                  <dt className="text-foreground-muted text-xs uppercase tracking-wider mb-0.5">
                    Sent
                  </dt>
                  <dd className="text-foreground">
                    {new Date(proposal.sent_at).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {proposal.approved_at && (
                <div>
                  <dt className="text-foreground-muted text-xs uppercase tracking-wider mb-0.5">
                    Approved
                  </dt>
                  <dd className="text-foreground">
                    {new Date(proposal.approved_at).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {proposal.typed_name && (
                <div>
                  <dt className="text-foreground-muted text-xs uppercase tracking-wider mb-0.5">
                    Signed By
                  </dt>
                  <dd className="text-foreground">{proposal.typed_name}</dd>
                </div>
              )}
            </dl>
          </GlowCard>

          {/* Revision History */}
          {revisions.length > 0 && (
            <GlowCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-foreground">
                  Revision Requests ({revisions.length})
                </h2>
              </div>
              <div className="space-y-4">
                {revisions.map((rev) => (
                  <div key={rev.id} className="space-y-1">
                    <p className="text-xs text-foreground-muted">
                      {new Date(rev.requested_at).toLocaleString()}
                      {rev.resolved_at && (
                        <span className="ml-2 text-green-400">Resolved</span>
                      )}
                    </p>
                    <p className="text-sm text-foreground bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                      {rev.message}
                    </p>
                  </div>
                ))}
              </div>
            </GlowCard>
          )}
        </div>
      </div>
    </div>
  );
}
