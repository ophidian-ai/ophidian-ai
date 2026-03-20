"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Megaphone, Plus, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import type { AdConfig } from "@/lib/supabase/types";

interface AdConfigRow extends AdConfig {
  clients: { company_name: string } | null;
}

const TIER_COLORS: Record<string, string> = {
  essentials: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  growth: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

export default function AdminAdsPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [configs, setConfigs] = useState<AdConfigRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchConfigs() {
      const res = await fetch("/api/admin/ads/configs");
      if (res.ok) {
        const data = await res.json();
        setConfigs(Array.isArray(data) ? data : []);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ad Management</h1>
          <p className="text-foreground-muted text-sm mt-1">
            {configs.length} client{configs.length !== 1 ? "s" : ""} with ad management
          </p>
        </div>
        <GlassButton size="sm" href="/dashboard/admin/ads/new">
          <span className="flex items-center gap-2">
            <Plus size={16} />
            New Config
          </span>
        </GlassButton>
      </div>

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
                  Platforms
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Monthly Budget
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Mgmt Fee
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
                  <td colSpan={7} className="px-5 py-12 text-center text-foreground-muted text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <Megaphone size={32} className="text-foreground-dim" />
                      <span>No ad management configs yet.</span>
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
                    <td className="px-5 py-4 text-sm text-foreground-muted">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1 text-xs ${
                            config.google_ads_connected ? "text-green-400" : "text-foreground-dim"
                          }`}
                        >
                          {config.google_ads_connected ? (
                            <CheckCircle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          Google
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs ${
                            config.meta_connected ? "text-green-400" : "text-foreground-dim"
                          }`}
                        >
                          {config.meta_connected ? (
                            <CheckCircle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          Meta
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground-muted">
                      {config.monthly_ad_budget != null
                        ? `$${config.monthly_ad_budget.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground-muted">
                      ${config.monthly_management_fee.toLocaleString()}/mo
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
                        href={`/dashboard/admin/ads/${config.id}`}
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
