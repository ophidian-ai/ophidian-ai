"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowLeft, Plus, X } from "lucide-react";
import type { Client } from "@/lib/supabase/types";

type SeoTier = "essentials" | "growth" | "pro";

interface Competitor {
  name: string;
  url: string;
}

interface FormState {
  url: string;
  client_id: string;
  tier: SeoTier;
  target_keywords: string;
  industry: string;
  location: string;
  gbp_url: string;
  delivery_email: string;
}

const INITIAL_FORM: FormState = {
  url: "",
  client_id: "",
  tier: "essentials",
  target_keywords: "",
  industry: "",
  location: "",
  gbp_url: "",
  delivery_email: "",
};

const TIERS: { value: SeoTier; label: string }[] = [
  { value: "essentials", label: "Essentials" },
  { value: "growth", label: "Growth" },
  { value: "pro", label: "Pro" },
];

const FIELD_CLASS =
  "w-full px-3 py-2 bg-surface/50 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary/50";

const LABEL_CLASS = "block text-sm font-medium text-foreground mb-1.5";

const HINT_CLASS = "mt-1 text-xs text-foreground-muted";

export default function NewSeoConfigPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [competitors, setCompetitors] = useState<Competitor[]>([{ name: "", url: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchClients() {
      const res = await fetch("/api/admin/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients ?? []);
      }
    }

    fetchClients();
  }, [role, router]);

  if (role !== "admin") return null;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addCompetitor() {
    setCompetitors((prev) => [...prev, { name: "", url: "" }]);
  }

  function removeCompetitor(index: number) {
    setCompetitors((prev) => prev.filter((_, i) => i !== index));
  }

  function setCompetitor(index: number, field: keyof Competitor, value: string) {
    setCompetitors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const keywords = form.target_keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const filteredCompetitors = competitors.filter((c) => c.url.trim());

    const payload = {
      url: form.url.trim(),
      client_id: form.client_id || null,
      tier: form.tier,
      target_keywords: keywords,
      competitors: filteredCompetitors,
      industry: form.industry.trim() || null,
      location: form.location.trim() || null,
      gbp_url: form.gbp_url.trim() || null,
      delivery_email: form.delivery_email.trim(),
    };

    const res = await fetch("/api/admin/seo/configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/admin/seo/${data.config?.id ?? ""}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create config. Please try again.");
      setSubmitting(false);
    }
  }

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
          <h1 className="text-2xl font-bold text-foreground">New SEO Config</h1>
          <p className="text-foreground-muted text-sm mt-0.5">
            Set up SEO automation for a client
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Identity
          </h2>

          <div>
            <label htmlFor="url" className={LABEL_CLASS}>
              Website URL <span className="text-red-400">*</span>
            </label>
            <input
              id="url"
              type="url"
              required
              value={form.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://acme.com"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="client_id" className={LABEL_CLASS}>
              Client
            </label>
            <select
              id="client_id"
              value={form.client_id}
              onChange={(e) => set("client_id", e.target.value)}
              className={FIELD_CLASS}
            >
              <option value="">-- Unassigned --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tier" className={LABEL_CLASS}>
              Tier <span className="text-red-400">*</span>
            </label>
            <select
              id="tier"
              required
              value={form.tier}
              onChange={(e) => set("tier", e.target.value as SeoTier)}
              className={FIELD_CLASS}
            >
              {TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="delivery_email" className={LABEL_CLASS}>
              Delivery Email <span className="text-red-400">*</span>
            </label>
            <input
              id="delivery_email"
              type="email"
              required
              value={form.delivery_email}
              onChange={(e) => set("delivery_email", e.target.value)}
              placeholder="client@acme.com"
              className={FIELD_CLASS}
            />
            <p className={HINT_CLASS}>Audit reports are sent to this address.</p>
          </div>
        </GlowCard>

        {/* SEO Settings */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            SEO Settings
          </h2>

          <div>
            <label htmlFor="target_keywords" className={LABEL_CLASS}>
              Target Keywords
            </label>
            <textarea
              id="target_keywords"
              rows={3}
              value={form.target_keywords}
              onChange={(e) => set("target_keywords", e.target.value)}
              placeholder="plumber columbus ohio, emergency plumbing, drain cleaning"
              className={`${FIELD_CLASS} resize-y`}
            />
            <p className={HINT_CLASS}>Comma-separated list of target keywords.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="industry" className={LABEL_CLASS}>
                Industry
              </label>
              <input
                id="industry"
                type="text"
                value={form.industry}
                onChange={(e) => set("industry", e.target.value)}
                placeholder="Plumbing"
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <label htmlFor="location" className={LABEL_CLASS}>
                Location
              </label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Columbus, IN"
                className={FIELD_CLASS}
              />
            </div>
          </div>

          <div>
            <label htmlFor="gbp_url" className={LABEL_CLASS}>
              Google Business Profile URL
            </label>
            <input
              id="gbp_url"
              type="url"
              value={form.gbp_url}
              onChange={(e) => set("gbp_url", e.target.value)}
              placeholder="https://maps.google.com/..."
              className={FIELD_CLASS}
            />
          </div>
        </GlowCard>

        {/* Competitors */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Competitors
          </h2>

          <div className="space-y-3">
            {competitors.map((comp, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={comp.name}
                  onChange={(e) => setCompetitor(index, "name", e.target.value)}
                  placeholder="Competitor Name"
                  className={`${FIELD_CLASS} flex-1`}
                />
                <input
                  type="url"
                  value={comp.url}
                  onChange={(e) => setCompetitor(index, "url", e.target.value)}
                  placeholder="https://competitor.com"
                  className={`${FIELD_CLASS} flex-1`}
                />
                {competitors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCompetitor(index)}
                    className="p-2 rounded-lg text-foreground-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addCompetitor}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Add Competitor
          </button>
        </GlowCard>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <GlassButton type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Config"}
          </GlassButton>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
