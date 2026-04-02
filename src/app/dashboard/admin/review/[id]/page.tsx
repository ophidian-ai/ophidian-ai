"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  XCircle,
  BarChart3,
  MessageSquare,
  RefreshCw,
  SkipForward,
} from "lucide-react";
import type { ReviewConfig, Review, ReviewResponse, ReviewAnalytics } from "@/lib/supabase/review-types";

interface ReviewWithResponses extends Review {
  review_responses: ReviewResponse[];
}

interface DetailData {
  config: ReviewConfig & { clients: { company_name: string } | null; gbp_connected: boolean };
  analytics: {
    totalReviews: number;
    overallResponseRate: number;
    sentimentSummary: { positive: number; neutral: number; negative: number };
    ratingTrend: Array<{ date: string; avg_rating: number; new_reviews: number }>;
  } | null;
  reviews: ReviewWithResponses[];
}

const TIER_COLORS: Record<string, string> = {
  essentials: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  growth: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  posted: "bg-green-500/15 text-green-400 border-green-500/30",
  skipped: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  draft: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
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

export default function AdminReviewDetailPage({
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

  // Filter state
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Action state per review
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [editTexts, setEditTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchDetail() {
      // Fetch config
      const configRes = await fetch(`/api/admin/review/configs`);
      const analyticsRes = await fetch(`/api/admin/review/analytics/${id}`);
      const reviewsRes = await fetch(`/api/admin/review/reviews?config_id=${id}&limit=50`);

      if (!configRes.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const configsData = await configRes.json();
      const config = (configsData.configs ?? []).find(
        (c: { id: string }) => c.id === id
      );

      if (!config) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const analytics = analyticsRes.ok ? await analyticsRes.json() : null;
      const reviewsData = reviewsRes.ok ? await reviewsRes.json() : { reviews: [] };

      setData({ config, analytics, reviews: reviewsData.reviews ?? [] });
      setLoading(false);
    }

    fetchDetail();
  }, [id, role, router]);

  async function handleGenerate(reviewId: string, responseId?: string) {
    setActionLoading((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const res = await fetch(`/api/admin/review/reviews/${reviewId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responseId ? { responseId } : {}),
      });
      if (res.ok) {
        const { response } = await res.json();
        setEditTexts((prev) => ({ ...prev, [reviewId]: response.generated_text }));
        // Refresh reviews
        const reviewsRes = await fetch(`/api/admin/review/reviews?config_id=${id}&limit=50`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setData((prev) => prev ? { ...prev, reviews: reviewsData.reviews ?? [] } : prev);
        }
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  }

  async function handleApprove(reviewId: string, responseId: string, text: string) {
    setActionLoading((prev) => ({ ...prev, [`approve-${reviewId}`]: true }));
    try {
      await fetch(`/api/admin/review/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseId, finalText: text, action: "approve" }),
      });
      const reviewsRes = await fetch(`/api/admin/review/reviews?config_id=${id}&limit=50`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setData((prev) => prev ? { ...prev, reviews: reviewsData.reviews ?? [] } : prev);
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [`approve-${reviewId}`]: false }));
    }
  }

  async function handleSkip(reviewId: string) {
    setActionLoading((prev) => ({ ...prev, [`skip-${reviewId}`]: true }));
    try {
      await fetch(`/api/admin/review/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "skip" }),
      });
      const reviewsRes = await fetch(`/api/admin/review/reviews?config_id=${id}&limit=50`);
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setData((prev) => prev ? { ...prev, reviews: reviewsData.reviews ?? [] } : prev);
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [`skip-${reviewId}`]: false }));
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
        <Link href="/dashboard/admin/review" className="text-primary text-sm hover:underline">
          Back to Review Management
        </Link>
      </div>
    );
  }

  const { config, analytics, reviews } = data;

  const filteredReviews = reviews.filter((r) => {
    if (platformFilter !== "all" && r.platform !== platformFilter) return false;
    if (statusFilter !== "all" && r.response_status !== statusFilter) return false;
    return true;
  });

  const statCards = [
    {
      label: "Total Reviews",
      value: analytics?.totalReviews?.toLocaleString() ?? "-",
      icon: Star,
      color: "#2D8CFF",
    },
    {
      label: "Response Rate",
      value: analytics ? `${analytics.overallResponseRate}%` : "-",
      icon: MessageSquare,
      color: "#00E67A",
    },
    {
      label: "Positive Sentiment",
      value: analytics?.sentimentSummary
        ? `${analytics.sentimentSummary.positive}`
        : "-",
      icon: CheckCircle,
      color: "#00E67A",
    },
    {
      label: "Negative Sentiment",
      value: analytics?.sentimentSummary
        ? `${analytics.sentimentSummary.negative}`
        : "-",
      icon: XCircle,
      color: "#ef4444",
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
                {config.clients?.company_name ?? "Unknown Client"}
              </h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                  TIER_COLORS[config.tier] ?? ""
                }`}
              >
                {config.tier}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  config.gbp_connected
                    ? "bg-green-500/15 text-green-400 border-green-500/30"
                    : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                }`}
              >
                {config.gbp_connected ? "GBP Connected" : "GBP Not Connected"}
              </span>
            </div>
            <p className="text-foreground-muted text-sm mt-0.5">
              Review feed &mdash; {reviews.length} reviews loaded
            </p>
          </div>
        </div>
        {config.tier === "pro" && (
          <GlassButton size="sm" href={`/dashboard/admin/review/campaigns/new?config_id=${id}`}>
            <span className="flex items-center gap-2">
              <Star size={16} />
              New Campaign
            </span>
          </GlassButton>
        )}
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

      {/* Config Info */}
      <GlowCard className="p-5">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
          Configuration
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">
              Auto-Respond Positive
            </p>
            <div className="flex items-center gap-1.5">
              {config.auto_respond_positive ? (
                <CheckCircle size={14} className="text-green-400" />
              ) : (
                <XCircle size={14} className="text-gray-400" />
              )}
              <span>{config.auto_respond_positive ? "On" : "Off"}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">
              Auto-Respond Negative
            </p>
            <div className="flex items-center gap-1.5">
              {config.auto_respond_negative ? (
                <CheckCircle size={14} className="text-green-400" />
              ) : (
                <XCircle size={14} className="text-gray-400" />
              )}
              <span>{config.auto_respond_negative ? "On" : "Off"}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">
              Brand Voice
            </p>
            <p className="text-foreground">{config.brand_voice?.tone ?? "Default"}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">
              Notification Email
            </p>
            <p className="text-foreground font-mono text-xs truncate">
              {config.notification_email}
            </p>
          </div>
        </div>
      </GlowCard>

      {/* Analytics chart placeholder */}
      {analytics && analytics.ratingTrend.length > 0 && (
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Rating Trend (30d)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">
                Sentiment Positive
              </p>
              <p className="text-2xl font-bold text-green-400">
                {analytics.sentimentSummary.positive}
              </p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">
                Sentiment Neutral
              </p>
              <p className="text-2xl font-bold text-yellow-400">
                {analytics.sentimentSummary.neutral}
              </p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">
                Sentiment Negative
              </p>
              <p className="text-2xl font-bold text-red-400">
                {analytics.sentimentSummary.negative}
              </p>
            </div>
          </div>
        </GlowCard>
      )}

      {/* Review Feed */}
      <GlowCard className="overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 flex-wrap">
          <span className="text-sm font-medium text-foreground-muted">Filter:</span>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-surface/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Platforms</option>
            <option value="google">Google</option>
            <option value="yelp">Yelp</option>
            <option value="facebook">Facebook</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="posted">Posted</option>
            <option value="skipped">Skipped</option>
          </select>
          <span className="text-xs text-foreground-muted ml-auto">
            {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {filteredReviews.length === 0 ? (
            <div className="px-5 py-12 text-center text-foreground-muted text-sm">
              <Star size={32} className="text-foreground-dim mx-auto mb-3" />
              No reviews match the current filters.
            </div>
          ) : (
            filteredReviews.map((review) => {
              const latestResponse = review.review_responses?.[0];
              const editText =
                editTexts[review.id] ??
                latestResponse?.final_text ??
                latestResponse?.generated_text ??
                "";

              return (
                <div key={review.id} className="px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm text-foreground">
                          {review.author_name}
                        </span>
                        <StarRow rating={review.rating} />
                        <span className="text-xs text-foreground-muted">
                          {formatDate(review.review_date)}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded border capitalize text-foreground-muted border-white/10">
                          {review.platform}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full border capitalize ${
                            STATUS_COLORS[review.response_status] ?? ""
                          }`}
                        >
                          {review.response_status}
                        </span>
                      </div>
                      {review.text && (
                        <p className="text-sm text-foreground-muted mt-1 leading-relaxed">
                          &ldquo;{review.text}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Response area */}
                  {review.response_status !== "posted" &&
                    review.response_status !== "skipped" && (
                      <div className="mt-4 space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) =>
                            setEditTexts((prev) => ({
                              ...prev,
                              [review.id]: e.target.value,
                            }))
                          }
                          rows={3}
                          placeholder="AI response will appear here..."
                          className="w-full bg-surface/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/30 placeholder:text-foreground-dim"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleGenerate(review.id, latestResponse?.id)
                            }
                            disabled={actionLoading[review.id]}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-foreground-muted hover:text-foreground hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <RefreshCw
                              size={12}
                              className={
                                actionLoading[review.id] ? "animate-spin" : ""
                              }
                            />
                            {latestResponse ? "Regenerate" : "Generate"}
                          </button>
                          {latestResponse && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprove(
                                    review.id,
                                    latestResponse.id,
                                    editText
                                  )
                                }
                                disabled={
                                  actionLoading[`approve-${review.id}`] ||
                                  !editText.trim()
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                <CheckCircle size={12} />
                                {actionLoading[`approve-${review.id}`]
                                  ? "Posting..."
                                  : "Approve & Post"}
                              </button>
                              <button
                                onClick={() => handleSkip(review.id)}
                                disabled={actionLoading[`skip-${review.id}`]}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-foreground-muted border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                <SkipForward size={12} />
                                Skip
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                  {review.response_status === "posted" && latestResponse && (
                    <div className="mt-3 pl-3 border-l-2 border-green-500/30">
                      <p className="text-xs text-foreground-muted mb-1">
                        Response posted {latestResponse.posted_at ? formatDate(latestResponse.posted_at) : ""}
                      </p>
                      <p className="text-sm text-foreground-muted">
                        {latestResponse.final_text ?? latestResponse.generated_text}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </GlowCard>
    </div>
  );
}
