"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowLeft, Send, Eye } from "lucide-react";

interface ReviewConfigOption {
  id: string;
  tier: string;
  clients: { company_name: string } | null;
}

function buildPreviewHtml(reviewLink: string): string {
  const safeLink = reviewLink.trim() || "#";
  return [
    "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='margin:0;padding:16px;background:#f9f9f9;font-family:Arial,sans-serif;'>",
    "<div style='max-width:560px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e0e0e0;overflow:hidden;'>",
    "<div style='padding:24px 32px;background:#0a0a0f;text-align:center;'>",
    "<div style='width:40px;height:40px;background:#39ff14;border-radius:50%;margin:0 auto;line-height:40px;font-size:20px;'>&#9733;</div>",
    "</div>",
    "<div style='padding:32px;'>",
    "<p style='margin:0 0 16px;font-size:16px;color:#111;'>Hi there,</p>",
    "<p style='margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;'>Thank you for your recent visit. We hope you had a great experience!</p>",
    "<p style='margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;'>If you have a moment, we&apos;d love to hear your feedback.</p>",
    "<div style='text-align:center;margin:24px 0;'>",
    "<a href='",
    safeLink.replace(/'/g, "%27"),
    "' style='display:inline-block;padding:14px 32px;background:#39ff14;border-radius:6px;font-size:15px;font-weight:600;color:#0a0a0f;text-decoration:none;'>Leave a Review</a>",
    "</div>",
    "<p style='margin:0;font-size:13px;color:#888;'>Thank you for your support.</p>",
    "</div></div></body></html>",
  ].join("");
}

function CampaignBuilderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role } = useDashboard();

  const defaultConfigId = searchParams.get("config_id") ?? "";

  const [configs, setConfigs] = useState<ReviewConfigOption[]>([]);
  const [configId, setConfigId] = useState(defaultConfigId);
  const [name, setName] = useState("");
  const [reviewLink, setReviewLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchConfigs() {
      const res = await fetch("/api/admin/review/configs");
      if (res.ok) {
        const data = await res.json();
        const proConfigs = (data.configs ?? []).filter(
          (c: ReviewConfigOption) => c.tier === "pro"
        );
        setConfigs(proConfigs);
        if (!configId && proConfigs.length > 0) {
          setConfigId(proConfigs[0].id);
        }
      }
    }

    fetchConfigs();
  }, [role, router, configId]);

  if (role !== "admin") return null;

  async function handleCreate(andSend = false) {
    if (!configId || !name.trim()) {
      setError("Config and campaign name are required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const createRes = await fetch("/api/admin/review/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config_id: configId,
          name: name.trim(),
          review_link: reviewLink.trim() || undefined,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        setError(err.error ?? "Failed to create campaign");
        return;
      }

      const campaign = await createRes.json();

      if (andSend) {
        setSending(true);
        const sendRes = await fetch(
          `/api/admin/review/campaigns/${campaign.id}/send`,
          { method: "POST" }
        );
        if (!sendRes.ok) {
          const err = await sendRes.json();
          setError(err.error ?? "Campaign created but failed to send");
          return;
        }
      }

      router.push(`/dashboard/admin/review/${configId}`);
    } finally {
      setSubmitting(false);
      setSending(false);
    }
  }

  const selectedConfig = configs.find((c) => c.id === configId);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Review Campaign</h1>
          <p className="text-foreground-muted text-sm mt-0.5">Pro tier only</p>
        </div>
      </div>

      {configs.length === 0 ? (
        <GlowCard className="p-6 text-center">
          <p className="text-foreground-muted text-sm">
            No Pro tier review configs found. Upgrade a client to Pro to create campaigns.
          </p>
        </GlowCard>
      ) : (
        <GlowCard className="p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Config select */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
              Client Config (Pro)
            </label>
            <select
              value={configId}
              onChange={(e) => setConfigId(e.target.value)}
              className="w-full bg-surface/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
            >
              {configs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clients?.company_name ?? c.id}
                </option>
              ))}
            </select>
            {selectedConfig && (
              <p className="mt-1 text-xs text-foreground-dim">
                Tier: {selectedConfig.tier}
              </p>
            )}
          </div>

          {/* Campaign name */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spring 2026 Review Drive"
              className="w-full bg-surface/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-foreground-dim"
            />
          </div>

          {/* Review link override */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted uppercase tracking-wider mb-2">
              Review Link (optional override)
            </label>
            <input
              type="url"
              value={reviewLink}
              onChange={(e) => setReviewLink(e.target.value)}
              placeholder="https://g.page/r/... (auto-fetched from GBP if blank)"
              className="w-full bg-surface/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-foreground-dim"
            />
          </div>

          {/* Email preview */}
          <div>
            <button
              type="button"
              onClick={() => setPreviewVisible((v) => !v)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              <Eye size={14} />
              {previewVisible ? "Hide" : "Preview"} email
            </button>
            {previewVisible && (
              <iframe
                srcDoc={buildPreviewHtml(reviewLink)}
                title="Email preview"
                className="mt-3 w-full rounded-lg border border-white/10 bg-white"
                style={{ height: 380 }}
                sandbox="allow-same-origin"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <GlassButton
              size="sm"
              onClick={() => handleCreate(false)}
              disabled={submitting || !name.trim() || !configId}
            >
              {submitting && !sending ? "Saving..." : "Save as Draft"}
            </GlassButton>
            <button
              onClick={() => handleCreate(true)}
              disabled={submitting || !name.trim() || !configId}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-background font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send size={14} />
              {sending ? "Sending..." : "Send Now"}
            </button>
          </div>
        </GlowCard>
      )}
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CampaignBuilderForm />
    </Suspense>
  );
}
