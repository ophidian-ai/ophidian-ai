"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { ProposalContent, PaymentMilestone } from "@/lib/supabase/types";

type ProposalStatus =
  | "draft"
  | "sent"
  | "revision_requested"
  | "approved"
  | "declined";

interface ClientInfo {
  contact_name: string | null;
  company_name: string;
}

interface ProposalData {
  id: string;
  content: ProposalContent;
  payment_schedule: Array<{
    milestone: PaymentMilestone;
    amount: number;
    percentage: number;
  }>;
  status: ProposalStatus;
  sent_at: string | null;
  approved_at: string | null;
  typed_name: string | null;
  clients: ClientInfo;
}

type ActionState = "idle" | "signing" | "revising" | "declining";
type PostAction = "signed" | "revised" | "declined" | null;

const MILESTONE_LABELS: Record<PaymentMilestone, string> = {
  deposit: "Deposit",
  midpoint: "Midpoint",
  final: "Final",
  monthly: "Monthly",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

export default function ProposalDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const proposalId = params.id;

  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sign state
  const [agreed, setAgreed] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [postAction, setPostAction] = useState<PostAction>(null);

  // Expand states for action panels
  const [showRevisePanel, setShowRevisePanel] = useState(false);
  const [reviseMessage, setReviseMessage] = useState("");
  const [showDeclinePanel, setShowDeclinePanel] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProposal() {
      try {
        const url = token
          ? `/api/proposals/${proposalId}?token=${encodeURIComponent(token)}`
          : `/api/proposals/${proposalId}`;

        const res = await fetch(url);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to load proposal");
          return;
        }
        const data = await res.json();
        setProposal(data);
      } catch {
        setError("Failed to load proposal");
      } finally {
        setLoading(false);
      }
    }

    loadProposal();
  }, [proposalId, token]);

  async function handleSign() {
    if (!agreed || !typedName.trim() || !token) return;
    setActionState("signing");
    setActionError(null);

    try {
      const res = await fetch(`/api/proposals/${proposalId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, typed_name: typedName.trim(), agreed: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to sign proposal");
        return;
      }
      setPostAction("signed");
    } catch {
      setActionError("An unexpected error occurred. Please try again.");
    } finally {
      setActionState("idle");
    }
  }

  async function handleRevise() {
    if (!reviseMessage.trim() || !token) return;
    setActionState("revising");
    setActionError(null);

    try {
      const res = await fetch(`/api/proposals/${proposalId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, message: reviseMessage.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to submit revision request");
        return;
      }
      setPostAction("revised");
    } catch {
      setActionError("An unexpected error occurred. Please try again.");
    } finally {
      setActionState("idle");
    }
  }

  async function handleDecline() {
    if (!token) return;
    setActionState("declining");
    setActionError(null);

    try {
      const res = await fetch(`/api/proposals/${proposalId}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          reason: declineReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to decline proposal");
        return;
      }
      setPostAction("declined");
    } catch {
      setActionError("An unexpected error occurred. Please try again.");
    } finally {
      setActionState("idle");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-foreground-dim">Loading proposal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center p-6">
        <div className="glass rounded-xl border border-red-500/20 p-8 max-w-md w-full text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <p className="text-foreground-dim text-sm mt-2">
            If you believe this is an error, contact{" "}
            <a
              href="mailto:eric.lefler@ophidianai.com"
              className="text-primary underline"
            >
              eric.lefler@ophidianai.com
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  if (!proposal) return null;

  const content = proposal.content;
  const companyName = proposal.clients?.company_name ?? "Your Company";
  const isSent = proposal.status === "sent" && !postAction;
  const canAct = isSent && !!token;

  return (
    <div className="min-h-screen bg-[#0D1B2A] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass rounded-xl border border-primary/10 p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-primary text-sm font-medium tracking-wide uppercase mb-1">
                OphidianAI
              </p>
              <h1 className="text-2xl font-bold text-foreground">{companyName}</h1>
              <p className="text-foreground-dim text-sm mt-1">Service Proposal</p>
            </div>
            {proposal.sent_at && (
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-foreground-dim">Sent</p>
                <p className="text-sm text-foreground">
                  {new Date(proposal.sent_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status banners for non-sent / post-action */}
        {postAction === "signed" && (
          <div className="glass rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <p className="text-emerald-400 font-medium">Proposal signed successfully.</p>
            <p className="text-foreground-dim text-sm mt-1">
              You'll receive your account setup email and invoice shortly.
            </p>
          </div>
        )}

        {postAction === "revised" && (
          <div className="glass rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
            <p className="text-amber-400 font-medium">Revision request submitted.</p>
            <p className="text-foreground-dim text-sm mt-1">
              We'll update the proposal and notify you.
            </p>
          </div>
        )}

        {postAction === "declined" && (
          <div className="glass rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-red-400 font-medium">Proposal declined.</p>
          </div>
        )}

        {!postAction && proposal.status === "approved" && (
          <div className="glass rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <p className="text-emerald-400 font-medium">
              Signed by {proposal.typed_name}
              {proposal.approved_at
                ? ` on ${new Date(proposal.approved_at).toLocaleDateString()}`
                : ""}
            </p>
          </div>
        )}

        {!postAction && proposal.status === "declined" && (
          <div className="glass rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-red-400 font-medium">This proposal has been declined.</p>
          </div>
        )}

        {!postAction && proposal.status === "revision_requested" && (
          <div className="glass rounded-xl border border-orange-500/20 bg-orange-500/5 p-6">
            <p className="text-orange-400 font-medium">Revision requested.</p>
            <p className="text-foreground-dim text-sm mt-1">
              We're working on updates and will send you a new link when ready.
            </p>
          </div>
        )}

        {/* Scope */}
        {content?.scope && (
          <div className="glass rounded-xl border border-primary/10 p-6">
            <h2 className="text-sm font-medium text-foreground-dim uppercase tracking-wide mb-3">
              Scope of Work
            </h2>
            <p className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">
              {content.scope}
            </p>
          </div>
        )}

        {/* Timeline */}
        {content?.timeline && (
          <div className="glass rounded-xl border border-primary/10 p-6">
            <h2 className="text-sm font-medium text-foreground-dim uppercase tracking-wide mb-3">
              Timeline
            </h2>
            <p className="text-foreground text-sm">{content.timeline}</p>
          </div>
        )}

        {/* Deliverables */}
        {content?.deliverables && content.deliverables.length > 0 && (
          <div className="glass rounded-xl border border-primary/10 p-6">
            <h2 className="text-sm font-medium text-foreground-dim uppercase tracking-wide mb-3">
              Deliverables
            </h2>
            <ul className="space-y-2">
              {content.deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-primary mt-0.5 flex-shrink-0">--</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing */}
        {(content?.basePrice != null || content?.finalPrice != null) && (
          <div className="glass rounded-xl border border-primary/10 p-6">
            <h2 className="text-sm font-medium text-foreground-dim uppercase tracking-wide mb-4">
              Pricing
            </h2>
            <div className="space-y-2">
              {content.basePrice != null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-dim">Base Price</span>
                  <span className="text-foreground">{formatCurrency(content.basePrice)}</span>
                </div>
              )}

              {content.discounts &&
                content.discounts.length > 0 &&
                content.discounts.map((discount, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-emerald-400">{discount.label}</span>
                    <span className="text-emerald-400">
                      -{formatCurrency(discount.amount)}
                    </span>
                  </div>
                ))}

              {content.finalPrice != null && (
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(content.finalPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Schedule */}
        {proposal.payment_schedule && proposal.payment_schedule.length > 0 && (
          <div className="glass rounded-xl border border-primary/10 p-6">
            <h2 className="text-sm font-medium text-foreground-dim uppercase tracking-wide mb-4">
              Payment Schedule
            </h2>
            <div className="space-y-0">
              {proposal.payment_schedule.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div>
                    <span className="text-sm text-foreground">
                      {MILESTONE_LABELS[item.milestone] ?? item.milestone}
                    </span>
                    <span className="text-xs text-foreground-dim ml-2">
                      ({item.percentage}%)
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions -- only shown when status is "sent" and not post-action */}
        {canAct && (
          <div className="space-y-4">
            {/* Sign & Submit */}
            <div className="glass rounded-xl border border-primary/20 p-6 space-y-5">
              <h2 className="text-base font-semibold text-foreground">Sign & Submit</h2>

              <div className="text-xs text-foreground-dim bg-white/[0.03] rounded-lg p-4 leading-relaxed border border-white/5">
                By typing your name below and clicking "Sign & Submit", you are
                electronically signing this proposal under the Electronic Signatures
                in Global and National Commerce Act (ESIGN Act). Your typed name
                constitutes your legal signature and you agree to be bound by the
                terms presented.
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-[#39FF14] w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm text-foreground">
                  I have read and agree to the terms above
                </span>
              </label>

              <div>
                <label
                  htmlFor="typed-name"
                  className="block text-xs text-foreground-dim mb-1.5"
                >
                  Type your full legal name
                </label>
                <input
                  id="typed-name"
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Full legal name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-dim/40 focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>

              {actionError && (
                <p className="text-sm text-red-400">{actionError}</p>
              )}

              <button
                type="button"
                onClick={handleSign}
                disabled={!agreed || !typedName.trim() || actionState === "signing"}
                className="w-full py-3 rounded-full bg-primary text-[#0D1B2A] font-semibold text-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: "#39FF14" }}
              >
                {actionState === "signing" ? "Submitting..." : "Sign & Submit"}
              </button>
            </div>

            {/* Request Changes */}
            <div className="glass rounded-xl border border-white/10 p-6">
              <button
                type="button"
                onClick={() => {
                  setShowRevisePanel(!showRevisePanel);
                  setShowDeclinePanel(false);
                  setActionError(null);
                }}
                className="text-sm text-foreground-dim hover:text-foreground transition-colors font-medium"
              >
                Request Changes
              </button>

              {showRevisePanel && (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={reviseMessage}
                    onChange={(e) => setReviseMessage(e.target.value)}
                    placeholder="Describe the changes you'd like..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-dim/40 focus:outline-none focus:border-primary/40 transition-colors resize-none"
                  />

                  {actionError && (
                    <p className="text-sm text-red-400">{actionError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleRevise}
                    disabled={!reviseMessage.trim() || actionState === "revising"}
                    className="px-5 py-2.5 rounded-full border border-white/20 text-sm text-foreground hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {actionState === "revising" ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              )}
            </div>

            {/* Decline */}
            <div className="glass rounded-xl border border-white/5 p-6">
              <button
                type="button"
                onClick={() => {
                  setShowDeclinePanel(!showDeclinePanel);
                  setShowRevisePanel(false);
                  setActionError(null);
                }}
                className="text-sm text-red-400/70 hover:text-red-400 transition-colors"
              >
                Decline Proposal
              </button>

              {showDeclinePanel && (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Optional: let us know why you're declining..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-dim/40 focus:outline-none focus:border-red-500/30 transition-colors resize-none"
                  />

                  {actionError && (
                    <p className="text-sm text-red-400">{actionError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleDecline}
                    disabled={actionState === "declining"}
                    className="px-5 py-2.5 rounded-full border border-red-500/30 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {actionState === "declining" ? "Processing..." : "Confirm Decline"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-foreground-dim/50">
            Prepared by OphidianAI &mdash;{" "}
            <a href="mailto:eric.lefler@ophidianai.com" className="hover:text-foreground-dim transition-colors">
              eric.lefler@ophidianai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
