"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Search, Plus, ExternalLink, Trash2 } from "lucide-react";

interface SeoConfig {
  id: string;
  website_url: string;
  tier: string;
  keywords: string[];
  industry: string | null;
  location: string | null;
  delivery_email: string;
  last_audit_at: string | null;
  latest_scores: {
    technical_score: number | null;
    content_score: number | null;
    backlink_score: number | null;
    local_score: number | null;
    performance_score: number | null;
    mobile_score: number | null;
  } | null;
  clients: { company_name: string } | null;
}

const TIER_COLORS: Record<string, string> = {
  essentials: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  growth: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

function averageScore(scores: SeoConfig["latest_scores"]): string {
  if (!scores) return "-";
  const values = [
    scores.technical_score,
    scores.content_score,
    scores.backlink_score,
    scores.local_score,
    scores.performance_score,
    scores.mobile_score,
  ].filter((v): v is number => v !== null);
  if (values.length === 0) return "-";
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg.toFixed(0);
}

function scoreColor(score: string): string {
  const n = Number(score);
  if (isNaN(n)) return "text-foreground-muted";
  if (n >= 80) return "text-green-400";
  if (n >= 60) return "text-yellow-400";
  return "text-red-400";
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminSeoPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [configs, setConfigs] = useState<SeoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" }[]>([]);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchConfigs() {
      const res = await fetch("/api/admin/seo/configs");
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs ?? []);
      }
      setLoading(false);
    }

    fetchConfigs();
  }, [role, router]);

  if (role !== "admin") return null;

  function addToast(message: string, type: "success" | "error") {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }

  async function handleRunNow(configId: string) {
    setRunningIds((prev) => new Set(prev).add(configId));
    try {
      const res = await fetch(`/api/admin/seo/configs/${configId}/run`, {
        method: "POST",
      });
      if (res.status === 429) {
        addToast("Audit already ran today.", "error");
      } else if (res.ok) {
        addToast("Audit started. Results in ~5 minutes.", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.error ?? "Failed to start audit.", "error");
      }
    } finally {
      setRunningIds((prev) => {
        const next = new Set(prev);
        next.delete(configId);
        return next;
      });
    }
  }

  async function handleDelete(configId: string) {
    setDeletingId(configId);
    try {
      const res = await fetch(`/api/admin/seo/configs/${configId}`, { method: "DELETE" });
      if (res.ok) {
        setConfigs((prev) => prev.filter((c) => c.id !== configId));
        addToast("Config deleted.", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.error ?? "Delete failed.", "error");
      }
    } catch {
      addToast("Delete failed: network error.", "error");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-3 rounded-lg border text-sm shadow-lg backdrop-blur-sm ${
                t.type === "success"
                  ? "bg-green-500/15 text-green-400 border-green-500/30"
                  : "bg-red-500/15 text-red-400 border-red-500/30"
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SEO Automation</h1>
          <p className="text-foreground-muted text-sm mt-1">
            {configs.length} config{configs.length !== 1 ? "s" : ""} across all clients
          </p>
        </div>
        <GlassButton size="sm" href="/dashboard/admin/seo/new">
          <span className="flex items-center gap-2">
            <Plus size={16} />
            New Config
          </span>
        </GlassButton>
      </div>

      {/* Table */}
      <GlowCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Client
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  URL
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Tier
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Keywords
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Last Audit
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Score
                </th>
                <th className="w-48" />
              </tr>
            </thead>
            <tbody>
              {configs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-foreground-muted text-sm"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Search size={32} className="text-foreground-dim" />
                      <span>No SEO configs yet.</span>
                      <Link
                        href="/dashboard/admin/seo/new"
                        className="text-primary text-sm hover:underline"
                      >
                        Create the first one
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                configs.map((config) => {
                  const score = averageScore(config.latest_scores);
                  const isRunning = runningIds.has(config.id);
                  return (
                    <tr
                      key={config.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-foreground">
                        {config.clients?.company_name ?? (
                          <span className="text-foreground-muted italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground-muted font-mono max-w-[200px] truncate">
                        {config.website_url}
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
                      <td className="px-5 py-4 text-sm text-foreground-muted">
                        {config.keywords?.length ?? 0}
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground-muted">
                        {formatDate(config.last_audit_at)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-semibold ${scoreColor(score)}`}>
                          {score !== "-" ? `${score}/100` : "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 justify-end">
                          <button
                            onClick={() => handleRunNow(config.id)}
                            disabled={isRunning}
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {isRunning ? (
                              <>
                                <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                                Running
                              </>
                            ) : (
                              "Run Now"
                            )}
                          </button>
                          <Link
                            href={`/dashboard/admin/seo/${config.id}`}
                            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExternalLink size={14} />
                            View
                          </Link>
                          {confirmDeleteId === config.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDelete(config.id)}
                                disabled={deletingId === config.id}
                                className="text-[10px] font-medium px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {deletingId === config.id ? "..." : "Delete"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] font-medium px-2 py-1 rounded bg-white/5 text-foreground-muted hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              title="Delete config"
                              onClick={() => setConfirmDeleteId(config.id)}
                              className="p-1.5 rounded-lg text-foreground-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
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
