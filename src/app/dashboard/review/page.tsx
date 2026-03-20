"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Star, MessageSquare, TrendingUp, CheckCircle, Edit2 } from "lucide-react";
import type { Review, ReviewResponse } from "@/lib/supabase/review-types";

interface DashboardData {
  config: {
    id: string;
    tier: string;
    gbp_connected: boolean;
  };
  stats: {
    totalReviews: number;
    avgRating: number;
    newThisMonth: number;
    responseRate: number;
  };
  recentReviews: Array<
    Pick<Review, "id" | "platform" | "author_name" | "rating" | "text" | "review_date" | "response_status" | "sentiment">
  >;
  pendingResponses: Array<
    ReviewResponse & {
      reviews: Pick<Review, "author_name" | "rating" | "text" | "platform"> | null;
    }
  >;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  posted: "bg-green-500/15 text-green-400 border-green-500/30",
  skipped: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "text-green-400",
  neutral: "text-yellow-400",
  negative: "text-red-400",
};

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= rating ? "text-yellow-400 fill-yellow-400" : "text-foreground-dim"}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ClientReviewPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline edit state for pending responses
  const [editTexts, setEditTexts] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (role === "admin") {
      router.replace("/dashboard/admin/review");
      return;
    }

    async function fetchDashboard() {
      const res = await fetch("/api/review/dashboard");
      if (res.status === 404) {
        setError("Review management is not configured for your account. Contact support.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Failed to load review dashboard.");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setLoading(false);
    }

    fetchDashboard();
  }, [role, router]);

  async function handleApprove(responseId: string) {
    setActionLoading((prev) => ({ ...prev, [responseId]: true }));
    try {
      await fetch(`/api/review/responses/${responseId}/approve`, { method: "POST" });
      // Refresh
      const res = await fetch("/api/review/dashboard");
      if (res.ok) setData(await res.json());
    } finally {
      setActionLoading((prev) => ({ ...prev, [responseId]: false }));
    }
  }

  async function handleEdit(responseId: string, finalText: string, post: boolean) {
    setActionLoading((prev) => ({ ...prev, [`edit-${responseId}`]: true }));
    try {
      await fetch(`/api/review/responses/${responseId}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalText, post }),
      });
      const res = await fetch("/api/review/dashboard");
      if (res.ok) setData(await res.json());
    } finally {
      setActionLoading((prev) => ({ ...prev, [`edit-${responseId}`]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <Star size={40} className="text-foreground-dim mx-auto mb-4" />
          <p className="text-foreground-muted text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentReviews, pendingResponses, config } = data;

  const statCards = [
    {
      label: "Total Reviews",
      value: stats.totalReviews.toLocaleString(),
      icon: Star,
      color: "#C4A265",
    },
    {
      label: "Average Rating",
      value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "-",
      icon: TrendingUp,
      color: "#7A9E7E",
    },
    {
      label: "New This Month",
      value: stats.newThisMonth.toLocaleString(),
      icon: Star,
      color: "#D4B87A",
    },
    {
      label: "Response Rate",
      value: `${stats.responseRate}%`,
      icon: MessageSquare,
      color: "#9B8EC4",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Management</h1>
          <p className="text-foreground-muted text-sm mt-1">
            <span className="capitalize">{config.tier}</span> plan &mdash;{" "}
            {config.gbp_connected ? (
              <span className="text-green-400">GBP Connected</span>
            ) : (
              <span className="text-foreground-dim">GBP Not Connected</span>
            )}
          </p>
        </div>
      </div>

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

      {/* Pending Responses */}
      {pendingResponses.length > 0 && (
        <GlowCard className="overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Pending Responses ({pendingResponses.length})
            </h2>
          </div>
          <div className="divide-y divide-white/5">
            {pendingResponses.map((response) => {
              const editText =
                editTexts[response.id] ??
                response.final_text ??
                response.generated_text;

              return (
                <div key={response.id} className="px-5 py-5">
                  {response.reviews && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {response.reviews.author_name}
                      </span>
                      <StarRow rating={response.reviews.rating} />
                      <span className="text-xs capitalize text-foreground-muted border border-white/10 px-1.5 py-0.5 rounded">
                        {response.reviews.platform}
                      </span>
                    </div>
                  )}
                  {response.reviews?.text && (
                    <p className="text-sm text-foreground-muted mb-3 leading-relaxed">
                      &ldquo;{response.reviews.text}&rdquo;
                    </p>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs text-foreground-muted uppercase tracking-wider">
                      Proposed Response
                    </label>
                    <textarea
                      value={editText}
                      onChange={(e) =>
                        setEditTexts((prev) => ({
                          ...prev,
                          [response.id]: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full bg-surface/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/30"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(response.id)}
                        disabled={actionLoading[response.id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle size={12} />
                        {actionLoading[response.id] ? "Posting..." : "Approve & Post"}
                      </button>
                      <button
                        onClick={() =>
                          handleEdit(response.id, editText, true)
                        }
                        disabled={actionLoading[`edit-${response.id}`]}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-foreground-muted hover:text-foreground hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Edit2 size={12} />
                        {actionLoading[`edit-${response.id}`]
                          ? "Saving..."
                          : "Edit & Post"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>
      )}

      {/* Recent Reviews */}
      <GlowCard className="overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Recent Reviews
          </h2>
        </div>
        <div className="divide-y divide-white/5">
          {recentReviews.length === 0 ? (
            <div className="px-5 py-12 text-center text-foreground-muted text-sm">
              <Star size={32} className="text-foreground-dim mx-auto mb-3" />
              No reviews yet. Reviews will appear here as they come in.
            </div>
          ) : (
            recentReviews.map((review) => (
              <div key={review.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {review.author_name}
                      </span>
                      <StarRow rating={review.rating} />
                      <span className="text-xs text-foreground-muted">
                        {formatDate(review.review_date)}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded border capitalize text-foreground-muted border-white/10">
                        {review.platform}
                      </span>
                      {review.sentiment && (
                        <span
                          className={`text-xs capitalize ${SENTIMENT_COLORS[review.sentiment] ?? ""}`}
                        >
                          {review.sentiment}
                        </span>
                      )}
                    </div>
                    {review.text && (
                      <p className="text-sm text-foreground-muted leading-relaxed">
                        &ldquo;{review.text}&rdquo;
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                      STATUS_COLORS[review.response_status] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30"
                    }`}
                  >
                    {review.response_status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </GlowCard>
    </div>
  );
}
