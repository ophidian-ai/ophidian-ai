"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowLeft } from "lucide-react";
import type { Client } from "@/lib/supabase/types";
import type { ChatbotTier } from "@/lib/supabase/chatbot-types";

interface FormState {
  slug: string;
  client_id: string;
  tier: ChatbotTier;
  system_prompt: string;
  greeting: string;
  allowed_origins: string;
  fallback_phone: string;
  fallback_email: string;
  primary_color: string;
}

const INITIAL_FORM: FormState = {
  slug: "",
  client_id: "",
  tier: "essentials",
  system_prompt: "",
  greeting: "Hi! How can I help you today?",
  allowed_origins: "",
  fallback_phone: "",
  fallback_email: "",
  primary_color: "#39ff14",
};

const TIERS: { value: ChatbotTier; label: string }[] = [
  { value: "essentials", label: "Essentials" },
  { value: "growth", label: "Growth" },
  { value: "pro", label: "Pro" },
];

const FIELD_CLASS =
  "w-full px-3 py-2 bg-surface/50 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary/50";

const LABEL_CLASS = "block text-sm font-medium text-foreground mb-1.5";

const HINT_CLASS = "mt-1 text-xs text-foreground-muted";

export default function NewChatbotConfigPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      slug: form.slug.trim(),
      client_id: form.client_id || null,
      tier: form.tier,
      system_prompt: form.system_prompt.trim(),
      greeting: form.greeting.trim(),
      allowed_origins: form.allowed_origins
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      fallback_contact: {
        phone: form.fallback_phone.trim() || null,
        email: form.fallback_email.trim() || null,
        address: null,
      },
      theme: {
        primaryColor: form.primary_color,
        position: "bottom-right",
        logoUrl: null,
      },
    };

    const res = await fetch("/api/admin/chatbot/configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/admin/chatbot/${data.config?.id ?? ""}`);
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
          <h1 className="text-2xl font-bold text-foreground">New Chatbot Config</h1>
          <p className="text-foreground-muted text-sm mt-0.5">
            Create a new AI chatbot configuration for a client
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
            <label htmlFor="slug" className={LABEL_CLASS}>
              Slug <span className="text-red-400">*</span>
            </label>
            <input
              id="slug"
              type="text"
              required
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="acme-hvac"
              pattern="[a-z0-9\-]+"
              className={FIELD_CLASS}
            />
            <p className={HINT_CLASS}>Lowercase letters, numbers, and hyphens only.</p>
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
              onChange={(e) => set("tier", e.target.value as ChatbotTier)}
              className={FIELD_CLASS}
            >
              {TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </GlowCard>

        {/* Behavior */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Behavior
          </h2>

          <div>
            <label htmlFor="system_prompt" className={LABEL_CLASS}>
              System Prompt <span className="text-red-400">*</span>
            </label>
            <textarea
              id="system_prompt"
              required
              rows={6}
              value={form.system_prompt}
              onChange={(e) => set("system_prompt", e.target.value)}
              placeholder="You are a helpful assistant for [Business Name]. You help customers with..."
              className={`${FIELD_CLASS} resize-y`}
            />
          </div>

          <div>
            <label htmlFor="greeting" className={LABEL_CLASS}>
              Greeting Message
            </label>
            <input
              id="greeting"
              type="text"
              value={form.greeting}
              onChange={(e) => set("greeting", e.target.value)}
              className={FIELD_CLASS}
            />
            <p className={HINT_CLASS}>First message shown when the chat opens.</p>
          </div>
        </GlowCard>

        {/* Access */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Access &amp; Origins
          </h2>

          <div>
            <label htmlFor="allowed_origins" className={LABEL_CLASS}>
              Allowed Origins
            </label>
            <input
              id="allowed_origins"
              type="text"
              value={form.allowed_origins}
              onChange={(e) => set("allowed_origins", e.target.value)}
              placeholder="https://acme.com, https://www.acme.com"
              className={FIELD_CLASS}
            />
            <p className={HINT_CLASS}>
              Comma-separated list of origins permitted to embed this chatbot. Leave blank to allow all.
            </p>
          </div>
        </GlowCard>

        {/* Fallback Contact */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Fallback Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fallback_phone" className={LABEL_CLASS}>
                Phone
              </label>
              <input
                id="fallback_phone"
                type="tel"
                value={form.fallback_phone}
                onChange={(e) => set("fallback_phone", e.target.value)}
                placeholder="(555) 555-5555"
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <label htmlFor="fallback_email" className={LABEL_CLASS}>
                Email
              </label>
              <input
                id="fallback_email"
                type="email"
                value={form.fallback_email}
                onChange={(e) => set("fallback_email", e.target.value)}
                placeholder="hello@acme.com"
                className={FIELD_CLASS}
              />
            </div>
          </div>
        </GlowCard>

        {/* Theme */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Theme
          </h2>

          <div>
            <label htmlFor="primary_color" className={LABEL_CLASS}>
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="primary_color"
                type="color"
                value={form.primary_color}
                onChange={(e) => set("primary_color", e.target.value)}
                className="h-9 w-16 rounded cursor-pointer bg-transparent border border-white/10"
              />
              <input
                type="text"
                value={form.primary_color}
                onChange={(e) => set("primary_color", e.target.value)}
                placeholder="#39ff14"
                className={`${FIELD_CLASS} w-32`}
              />
            </div>
          </div>
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
