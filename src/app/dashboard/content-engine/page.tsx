"use client";

import { useEffect, useState, useCallback } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { ModuleGuard } from "@/components/dashboard/module-guard";
import { GlowCard } from "@/components/ui/spotlight-card";
import type {
  ContentBatch,
  ContentPost,
  ContentBatchStatus,
  ContentPlatform,
  ContentPillar,
  PlatformMetrics,
} from "@/lib/supabase/types";
import {
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Send,
  FileEdit,
  Eye,
  Loader2,
  Calendar,
  Hash,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  BarChart2,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Users,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<
  ContentBatchStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  draft: { label: "Draft", color: "text-zinc-400", icon: FileEdit },
  review: { label: "In Review", color: "text-amber-400", icon: Eye },
  approved: { label: "Approved", color: "text-emerald-400", icon: CheckCircle2 },
  scheduled: { label: "Scheduled", color: "text-blue-400", icon: Calendar },
  published: { label: "Published", color: "text-primary", icon: Send },
};

const PILLAR_LABELS: Record<ContentPillar, string> = {
  proof_of_work: "Proof of Work",
  ai_education: "AI Education",
  website_tips: "Website Tips",
  showcase: "Showcase",
  local_relevance: "Local Relevance",
  behind_the_scenes: "Behind the Scenes",
};

const PLATFORM_LABELS: Record<ContentPlatform, string> = {
  facebook: "FB",
  instagram: "IG",
  linkedin: "LI",
  tiktok: "TT",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ContentEnginePage() {
  const { modules, role } = useDashboard();

  return (
    <ModuleGuard modules={modules} required="content_engine">
      <ContentEngineContent isAdmin={role === "admin"} />
    </ModuleGuard>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Content                                                       */
/* ------------------------------------------------------------------ */

type BatchWithPosts = ContentBatch & { posts: ContentPost[] };

function ContentEngineContent({ isAdmin }: { isAdmin: boolean }) {
  const [batches, setBatches] = useState<ContentBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchWithPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewBatch, setShowNewBatch] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/content-engine/batches");
      if (!res.ok) throw new Error("Failed to load batches");
      const data = await res.json();
      setBatches(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const openBatch = useCallback(async (batchId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/content-engine/batches/${batchId}`);
      if (!res.ok) throw new Error("Failed to load batch");
      const data = await res.json();
      setSelectedBatch(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const goBack = useCallback(() => {
    setSelectedBatch(null);
    fetchBatches();
  }, [fetchBatches]);

  const createBatch = useCallback(
    async (label: string, start: string, end: string) => {
      setCreating(true);
      try {
        const res = await fetch("/api/content-engine/batches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batch_label: label,
            period_start: start,
            period_end: end,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Failed" }));
          throw new Error(err.error || "Failed to create batch");
        }
        setShowNewBatch(false);
        await fetchBatches();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setCreating(false);
      }
    },
    [fetchBatches]
  );

  if (loading && !selectedBatch && batches.length === 0) {
    return (
      <div className="p-6 md:p-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedBatch && (
            <button
              type="button"
              onClick={goBack}
              title="Back to batches"
              className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles size={24} className="text-primary" />
              Content Engine
            </h1>
            <p className="text-sm text-foreground-muted mt-1">
              {selectedBatch
                ? selectedBatch.batch_label
                : "Manage social media content batches"}
            </p>
          </div>
        </div>
        {isAdmin && !selectedBatch && (
          <button
            type="button"
            onClick={() => setShowNewBatch((v) => !v)}
            className="text-xs font-medium px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer"
          >
            {showNewBatch ? "Cancel" : "New Batch"}
          </button>
        )}
      </div>

      {/* New Batch Form */}
      {showNewBatch && <NewBatchForm onSubmit={createBatch} loading={creating} />}

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {selectedBatch ? (
        <BatchDetail
          batch={selectedBatch}
          isAdmin={isAdmin}
          onStatusChange={async (status) => {
            const res = await fetch(
              `/api/content-engine/batches/${selectedBatch.id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
              }
            );
            if (res.ok) {
              const updated = await res.json();
              setSelectedBatch({ ...selectedBatch, ...updated });
            }
          }}
          onPostUpdate={async (postId, updates) => {
            const res = await fetch(`/api/content-engine/posts/${postId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updates),
            });
            if (res.ok) {
              const updatedPost = await res.json();
              setSelectedBatch((prev) =>
                prev
                  ? {
                      ...prev,
                      posts: prev.posts.map((p) =>
                        p.id === postId ? updatedPost : p
                      ),
                    }
                  : null
              );
            }
          }}
        />
      ) : (
        <BatchList
          batches={batches}
          loading={loading}
          onSelect={openBatch}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Batch List                                                         */
/* ------------------------------------------------------------------ */

function BatchList({
  batches,
  loading,
  onSelect,
}: {
  batches: ContentBatch[];
  loading: boolean;
  onSelect: (id: string) => void;
}) {
  if (!loading && batches.length === 0) {
    return (
      <GlowCard className="p-12 text-center">
        <Sparkles size={40} className="mx-auto text-foreground-muted mb-4" />
        <p className="text-foreground-muted text-lg">No batches yet</p>
        <p className="text-foreground-muted/60 text-sm mt-2">
          Run <code className="font-mono text-primary/80">/social-content</code> to
          generate your first batch
        </p>
      </GlowCard>
    );
  }

  return (
    <div className="grid gap-4">
      {batches.map((batch) => {
        const cfg = STATUS_CONFIG[batch.status];
        const StatusIcon = cfg.icon;
        return (
          <GlowCard
            key={batch.id}
            className="p-5 cursor-pointer hover:border-primary/20 transition-colors"
            onClick={() => onSelect(batch.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color} border-current/20 bg-current/5`}
                >
                  <StatusIcon size={12} />
                  {cfg.label}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {batch.batch_label}
                  </h3>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {formatDate(batch.period_start)} &ndash;{" "}
                    {formatDate(batch.period_end)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-foreground-muted">
                <span>{batch.post_count} posts</span>
                <span>{formatDate(batch.created_at)}</span>
              </div>
            </div>
          </GlowCard>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Batch Detail                                                       */
/* ------------------------------------------------------------------ */

function BatchDetail({
  batch,
  isAdmin,
  onStatusChange,
  onPostUpdate,
}: {
  batch: BatchWithPosts;
  isAdmin: boolean;
  onStatusChange: (status: ContentBatchStatus) => Promise<void>;
  onPostUpdate: (postId: string, updates: Partial<ContentPost>) => Promise<void>;
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);

  const cfg = STATUS_CONFIG[batch.status];
  const StatusIcon = cfg.icon;

  const handleStatusChange = async (status: ContentBatchStatus) => {
    setActionLoading(true);
    await onStatusChange(status);
    setActionLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Batch header card */}
      <GlowCard className="p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color} border-current/20 bg-current/5`}
            >
              <StatusIcon size={12} />
              {cfg.label}
            </div>
            <div className="text-sm text-foreground-muted">
              {batch.post_count} posts &middot;{" "}
              {formatDate(batch.period_start)} &ndash;{" "}
              {formatDate(batch.period_end)}
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              {batch.status === "draft" && (
                <ActionButton
                  label="Send for Review"
                  loading={actionLoading}
                  onClick={() => handleStatusChange("review")}
                />
              )}
              {batch.status === "review" && (
                <ActionButton
                  label="Approve Batch"
                  loading={actionLoading}
                  variant="primary"
                  onClick={() => handleStatusChange("approved")}
                />
              )}
              {batch.status === "approved" && (
                <ActionButton
                  label="Mark Scheduled"
                  loading={actionLoading}
                  onClick={() => handleStatusChange("scheduled")}
                />
              )}
              {batch.status === "scheduled" && (
                <ActionButton
                  label="Mark Published"
                  loading={actionLoading}
                  variant="primary"
                  onClick={() => handleStatusChange("published")}
                />
              )}
            </div>
          )}
        </div>
      </GlowCard>

      {/* Analytics summary (published batches) */}
      {batch.status === "published" && batch.posts.some((p) => p.platform_metrics) && (
        <BatchAnalyticsSummary posts={batch.posts} />
      )}

      {/* Post grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {batch.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            batchStatus={batch.status}
            isAdmin={isAdmin}
            isEditing={editingPost === post.id}
            onStartEdit={() => setEditingPost(post.id)}
            onCancelEdit={() => setEditingPost(null)}
            onSave={async (updates) => {
              await onPostUpdate(post.id, updates);
              setEditingPost(null);
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Post Card                                                          */
/* ------------------------------------------------------------------ */

function PostCard({
  post,
  batchStatus,
  isAdmin,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSave,
}: {
  post: ContentPost;
  batchStatus: ContentBatchStatus;
  isAdmin: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updates: Partial<ContentPost>) => Promise<void>;
}) {
  const [editHook, setEditHook] = useState(post.hook);
  const [editBody, setEditBody] = useState(post.body);
  const [editCta, setEditCta] = useState(post.cta);
  const [saving, setSaving] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ hook: editHook, body: editBody, cta: editCta });
    setSaving(false);
  };

  return (
    <GlowCard className="p-4 flex flex-col">
      {/* Post header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary/80 font-mono">
            #{post.post_number}
          </span>
          <span className="text-xs text-foreground-muted px-2 py-0.5 rounded bg-white/5 border border-white/10">
            {PILLAR_LABELS[post.pillar] || post.pillar}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {post.platforms.map((p) => (
            <span
              key={p}
              className="text-[10px] font-bold text-foreground-muted/60 px-1.5 py-0.5 rounded bg-white/5"
            >
              {PLATFORM_LABELS[p] || p}
            </span>
          ))}
        </div>
      </div>

      {/* Image placeholder */}
      <div className="w-full aspect-video rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-3">
        {post.image_urls ? (
          <img
            src={Object.values(post.image_urls)[0] || ""}
            alt={`Post ${post.post_number}`}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-foreground-muted/40">
            <ImageIcon size={24} />
            <span className="text-[10px]">{post.image_source}</span>
          </div>
        )}
      </div>

      {/* Copy */}
      {isEditing ? (
        <div className="space-y-2 flex-1">
          <label className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
            Hook
          </label>
          <textarea
            value={editHook}
            onChange={(e) => setEditHook(e.target.value)}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/40"
          />
          <label className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
            Body
          </label>
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/40"
          />
          <label className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
            CTA
          </label>
          <textarea
            value={editCta}
            onChange={(e) => setEditCta(e.target.value)}
            rows={1}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/40"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onCancelEdit}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-2">
          <p className="text-sm font-semibold text-foreground leading-snug">
            {post.hook}
          </p>
          <p className="text-xs text-foreground-muted leading-relaxed line-clamp-4">
            {post.body}
          </p>
          <p className="text-xs text-primary/80 font-medium">{post.cta}</p>
        </div>
      )}

      {/* Metrics panel (published batches) */}
      {batchStatus === "published" && showMetrics && (
        <MetricsPanel
          post={post}
          onSave={async (metrics) => {
            await onSave({ platform_metrics: metrics });
            setShowMetrics(false);
          }}
          onClose={() => setShowMetrics(false)}
        />
      )}

      {/* Metrics summary (published, already logged) */}
      {batchStatus === "published" && !showMetrics && post.platform_metrics && (
        <MetricsSummaryRow metrics={post.platform_metrics} />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2 text-foreground-muted/50">
          {post.hashtags.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <Hash size={10} />
              {post.hashtags.length}
            </span>
          )}
          {post.scheduled_date && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <Calendar size={10} />
              {formatDate(post.scheduled_date)}
            </span>
          )}
        </div>

        {isAdmin && !isEditing && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onStartEdit}
              className="text-[10px] font-medium px-2 py-1 rounded bg-white/5 text-foreground-muted hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer"
              title="Edit copy"
            >
              <FileEdit size={12} />
            </button>
            <button
              type="button"
              className="text-[10px] font-medium px-2 py-1 rounded bg-white/5 text-foreground-muted hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer"
              title="Regenerate image"
            >
              <RefreshCw size={12} />
            </button>
            {batchStatus === "published" && (
              <button
                type="button"
                onClick={() => setShowMetrics((v) => !v)}
                className="text-[10px] font-medium px-2 py-1 rounded bg-white/5 text-foreground-muted hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer"
                title="Log engagement metrics"
              >
                <BarChart2 size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Analytics Components                                               */
/* ------------------------------------------------------------------ */

const METRIC_FIELDS: Record<
  ContentPlatform,
  { key: keyof PlatformMetrics; label: string; icon: typeof Heart }[]
> = {
  facebook:  [
    { key: "likes", label: "Likes", icon: Heart },
    { key: "comments", label: "Comments", icon: MessageCircle },
    { key: "shares", label: "Shares", icon: Share2 },
    { key: "reach", label: "Reach", icon: Users },
  ],
  instagram: [
    { key: "likes", label: "Likes", icon: Heart },
    { key: "comments", label: "Comments", icon: MessageCircle },
    { key: "saves", label: "Saves", icon: Bookmark },
    { key: "reach", label: "Reach", icon: Users },
  ],
  linkedin:  [
    { key: "likes", label: "Likes", icon: Heart },
    { key: "comments", label: "Comments", icon: MessageCircle },
    { key: "shares", label: "Shares", icon: Share2 },
    { key: "reach", label: "Reach", icon: Users },
  ],
  tiktok:    [
    { key: "likes", label: "Likes", icon: Heart },
    { key: "comments", label: "Comments", icon: MessageCircle },
    { key: "shares", label: "Shares", icon: Share2 },
    { key: "views", label: "Views", icon: Play },
  ],
};

function MetricsPanel({
  post,
  onSave,
  onClose,
}: {
  post: ContentPost;
  onSave: (metrics: Partial<Record<ContentPlatform, PlatformMetrics>>) => Promise<void>;
  onClose: () => void;
}) {
  const [values, setValues] = useState<
    Partial<Record<ContentPlatform, Partial<PlatformMetrics>>>
  >(post.platform_metrics ?? {});
  const [saving, setSaving] = useState(false);

  const set = (platform: ContentPlatform, key: keyof PlatformMetrics, raw: string) => {
    const n = raw === "" ? undefined : parseInt(raw, 10);
    setValues((prev) => ({
      ...prev,
      [platform]: { ...(prev[platform] ?? {}), [key]: isNaN(n as number) ? undefined : n },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(values as Partial<Record<ContentPlatform, PlatformMetrics>>);
    setSaving(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider flex items-center gap-1">
          <BarChart2 size={10} /> Engagement Metrics
        </span>
        <button type="button" onClick={onClose} title="Close metrics panel" className="text-foreground-muted/50 hover:text-foreground-muted cursor-pointer">
          <X size={12} />
        </button>
      </div>
      {post.platforms.map((platform) => (
        <div key={platform} className="space-y-1.5">
          <span className="text-[10px] font-bold text-foreground-muted uppercase">
            {PLATFORM_LABELS[platform]}
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {METRIC_FIELDS[platform].map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-0.5">
                <label className="text-[9px] text-foreground-muted/60">{label}</label>
                <input
                  type="number"
                  min="0"
                  placeholder="—"
                  value={values[platform]?.[key] ?? ""}
                  onChange={(e) => set(platform, key, e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/40 w-full"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Metrics"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 text-foreground-muted hover:bg-white/10 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function MetricsSummaryRow({
  metrics,
}: {
  metrics: Partial<Record<ContentPlatform, PlatformMetrics>>;
}) {
  const totalLikes = Object.values(metrics).reduce((s, m) => s + (m?.likes ?? 0), 0);
  const totalReach = Object.values(metrics).reduce((s, m) => s + (m?.reach ?? 0), 0);
  const totalComments = Object.values(metrics).reduce((s, m) => s + (m?.comments ?? 0), 0);

  return (
    <div className="mt-2 flex items-center gap-3 text-[10px] text-foreground-muted/60">
      {totalLikes > 0 && (
        <span className="flex items-center gap-0.5"><Heart size={9} /> {totalLikes.toLocaleString()}</span>
      )}
      {totalComments > 0 && (
        <span className="flex items-center gap-0.5"><MessageCircle size={9} /> {totalComments.toLocaleString()}</span>
      )}
      {totalReach > 0 && (
        <span className="flex items-center gap-0.5"><Users size={9} /> {totalReach.toLocaleString()} reach</span>
      )}
    </div>
  );
}

function BatchAnalyticsSummary({ posts }: { posts: ContentPost[] }) {
  const postsWithMetrics = posts.filter((p) => p.platform_metrics);
  if (postsWithMetrics.length === 0) return null;

  let totalReach = 0;
  let totalLikes = 0;
  let totalEngagements = 0;
  let topPost = postsWithMetrics[0];
  let topEngagement = 0;

  for (const post of postsWithMetrics) {
    const m = post.platform_metrics!;
    const reach = Object.values(m).reduce((s, pm) => s + (pm?.reach ?? 0), 0);
    const likes = Object.values(m).reduce((s, pm) => s + (pm?.likes ?? 0), 0);
    const comments = Object.values(m).reduce((s, pm) => s + (pm?.comments ?? 0), 0);
    const shares = Object.values(m).reduce((s, pm) => s + (pm?.shares ?? 0), 0);
    const engagement = likes + comments + shares;
    totalReach += reach;
    totalLikes += likes;
    totalEngagements += engagement;
    if (engagement > topEngagement) { topEngagement = engagement; topPost = post; }
  }

  const engagementRate = totalReach > 0
    ? ((totalEngagements / totalReach) * 100).toFixed(1)
    : null;

  return (
    <GlowCard className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 size={14} className="text-primary" />
        <span className="text-xs font-semibold text-foreground">Batch Analytics</span>
        <span className="text-[10px] text-foreground-muted/50">
          {postsWithMetrics.length}/{posts.length} posts logged
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total Reach" value={totalReach.toLocaleString()} />
        <Stat label="Total Likes" value={totalLikes.toLocaleString()} />
        <Stat label="Engagements" value={totalEngagements.toLocaleString()} />
        <Stat label="Eng. Rate" value={engagementRate ? `${engagementRate}%` : "—"} />
      </div>
      {topEngagement > 0 && (
        <p className="text-[10px] text-foreground-muted/60 mt-3">
          Top post: <span className="text-foreground-muted">#{topPost.post_number} — {topPost.hook}</span>
        </p>
      )}
    </GlowCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-foreground-muted/60 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-foreground font-mono">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared Components                                                  */
/* ------------------------------------------------------------------ */

function ActionButton({
  label,
  loading,
  variant = "default",
  onClick,
}: {
  label: string;
  loading: boolean;
  variant?: "default" | "primary";
  onClick: () => void;
}) {
  const base =
    "text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50";
  const styles =
    variant === "primary"
      ? `${base} bg-primary/20 text-primary hover:bg-primary/30`
      : `${base} bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-foreground`;

  return (
    <button onClick={onClick} disabled={loading} className={styles}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  New Batch Form                                                     */
/* ------------------------------------------------------------------ */

function NewBatchForm({
  onSubmit,
  loading,
}: {
  onSubmit: (label: string, start: string, end: string) => Promise<void>;
  loading: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const [label, setLabel] = useState(
    `Week of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  );
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(nextWeek);

  return (
    <GlowCard className="p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Create New Batch</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label htmlFor="batch-label" className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
            Batch Label
          </label>
          <input
            id="batch-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
        <div>
          <label htmlFor="batch-start" className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
            Period Start
          </label>
          <input
            id="batch-start"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
        <div>
          <label htmlFor="batch-end" className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
            Period End
          </label>
          <input
            id="batch-end"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => onSubmit(label, start, end)}
            disabled={loading || !label.trim()}
            className="text-xs font-medium px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : "Create Batch"}
          </button>
        </div>
      </div>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
