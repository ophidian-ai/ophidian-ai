"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Star, Plus, ExternalLink, CheckCircle, XCircle } from "lucide-react";

interface ReviewConfigRow {
  id: string;
  tier: string;
  notification_email: string;
  auto_respond_positive: boolean;
  auto_respond_negative: boolean;
  active: boolean;
  gbp_connected: boolean;
  created_at: string;
  clients: { company_name: string; slug: string } | null;
  // Derived from query -- may not always be present
  pending_count?: number;
  total_reviews?: number;
  avg_rating?: number;
}

const TIER_COLORS: Record<string, string> = {
  essentials: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  growth: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-foreground-dim"}
        />
      ))}
      <span className="ml-1 text-xs text-foreground-muted">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function AdminReviewPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [configs, setConfigs] = useState<ReviewConfigRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchConfigs() {
      const res = await fetch("/api/admin/review/configs");
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs ?? []);
      }
      setLoading(false);
    }

    fetchConfigs();
  }, [role, router]);

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Management</h1>
          <p className="text-foreground-muted text-sm mt-1">
            {configs.length} config{configs.length !== 1 ? "s" : ""} across all clients
          </p>
        </div>
        <GlassButton size="sm" href="/dashboard/admin/review/new">
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
                  Tier
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  GBP
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Avg Rating
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Total Reviews
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Pending
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {configs.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-foreground-muted text-sm"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Star size={32} className="text-foreground-dim" />
                      <span>No review configs yet.</span>
                      <Link
                        href="/dashboard/admin/review/new"
                        className="text-primary text-sm hover:underline"
                      >
                        Create the first one
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                configs.map((config) => (
                  <tr
                    key={config.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-foreground">
                      {config.clients?.company_name ?? (
                        <span className="text-foreground-muted italic">Unassigned</span>
                      )}
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
                    <td className="px-5 py-4">
                      {config.gbp_connected ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <XCircle size={16} className="text-foreground-dim" />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {config.avg_rating != null ? (
                        <StarRating rating={config.avg_rating} />
                      ) : (
                        <span className="text-xs text-foreground-dim">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground-muted">
                      {config.total_reviews?.toLocaleString() ?? "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground-muted">
                      {config.pending_count != null && config.pending_count > 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
                          {config.pending_count}
                        </span>
                      ) : (
                        <span className="text-foreground-dim">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          config.active
                            ? "bg-green-500/15 text-green-400 border-green-500/30"
                            : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                        }`}
                      >
                        {config.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/admin/review/${config.id}`}
                        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        <ExternalLink size={14} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </div>
  );
}
