"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowLeft, Sparkles } from "lucide-react";

interface EmailConfigOption {
  id: string;
  sending_domain: string;
  clients: { company_name: string } | null;
}

interface EmailTemplateOption {
  id: string;
  name: string;
  category: string;
}

interface FormState {
  config_id: string;
  template_id: string;
  name: string;
  subject: string;
  content: string;
  segment_tags: string;
  segment_engagement_min: string;
  scheduled_at: string;
}

const INITIAL_FORM: FormState = {
  config_id: "",
  template_id: "",
  name: "",
  subject: "",
  content: "",
  segment_tags: "",
  segment_engagement_min: "",
  scheduled_at: "",
};

const FIELD_CLASS =
  "w-full px-3 py-2 bg-surface/50 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary/50";

const LABEL_CLASS = "block text-sm font-medium text-foreground mb-1.5";

const HINT_CLASS = "mt-1 text-xs text-foreground-muted";

export default function NewCampaignPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [configs, setConfigs] = useState<EmailConfigOption[]>([]);
  const [templates, setTemplates] = useState<EmailTemplateOption[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchData() {
      const [configsRes, templatesRes] = await Promise.all([
        fetch("/api/admin/email/configs"),
        fetch("/api/admin/email/templates"),
      ]);

      if (configsRes.ok) {
        const data = await configsRes.json();
        setConfigs(data.configs ?? []);
      }
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates ?? []);
      }
    }

    fetchData();
  }, [role, router]);

  if (role !== "admin") return null;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerate() {
    if (!form.config_id) {
      setError("Select a config before generating.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      // Create a draft campaign first, then call generate
      const createRes = await fetch("/api/admin/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config_id: form.config_id,
          template_id: form.template_id || null,
          name: form.name || "Draft Campaign",
          subject: form.subject,
          content: form.content,
          segment_filter: buildSegmentFilter(),
          scheduled_at: form.scheduled_at || null,
          status: "draft",
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}));
        setError(data.error ?? "Failed to create draft for generation.");
        return;
      }

      const { campaign } = await createRes.json();
      const genRes = await fetch(
        `/api/admin/email/campaigns/${campaign.id}/generate`,
        { method: "POST" }
      );

      if (genRes.ok) {
        const genData = await genRes.json();
        if (genData.subject) set("subject", genData.subject);
        if (genData.content) set("content", genData.content);
      } else {
        const data = await genRes.json().catch(() => ({}));
        setError(data.error ?? "AI generation failed.");
      }
    } finally {
      setGenerating(false);
    }
  }

  function buildSegmentFilter() {
    const tags = form.segment_tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const engMin = form.segment_engagement_min
      ? Number(form.segment_engagement_min)
      : undefined;

    if (tags.length === 0 && engMin === undefined) return null;

    return {
      ...(tags.length > 0 ? { tags } : {}),
      ...(engMin !== undefined ? { engagement_min: engMin } : {}),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      config_id: form.config_id,
      template_id: form.template_id || null,
      name: form.name.trim(),
      subject: form.subject.trim(),
      content: form.content.trim(),
      segment_filter: buildSegmentFilter(),
      scheduled_at: form.scheduled_at || null,
      status: form.scheduled_at ? "scheduled" : "draft",
    };

    const createRes = await fetch("/api/admin/email/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!createRes.ok) {
      const data = await createRes.json().catch(() => ({}));
      setError(data.error ?? "Failed to create campaign. Please try again.");
      setSubmitting(false);
      return;
    }

    const { campaign } = await createRes.json();

    if (form.scheduled_at) {
      await fetch(`/api/admin/email/campaigns/${campaign.id}/send`, {
        method: "POST",
      });
    }

    router.push(`/dashboard/admin/email/${form.config_id}`);
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
          <h1 className="text-2xl font-bold text-foreground">New Campaign</h1>
          <p className="text-foreground-muted text-sm mt-0.5">
            Create and schedule an email campaign
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Config & Template */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Configuration
          </h2>

          <div>
            <label htmlFor="config_id" className={LABEL_CLASS}>
              Client Config <span className="text-red-400">*</span>
            </label>
            <select
              id="config_id"
              required
              value={form.config_id}
              onChange={(e) => set("config_id", e.target.value)}
              className={FIELD_CLASS}
            >
              <option value="">-- Select a config --</option>
              {configs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clients?.company_name ?? "Unassigned"} ({c.sending_domain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="template_id" className={LABEL_CLASS}>
              Template
            </label>
            <select
              id="template_id"
              value={form.template_id}
              onChange={(e) => set("template_id", e.target.value)}
              className={FIELD_CLASS}
            >
              <option value="">-- No template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className={LABEL_CLASS}>
              Campaign Name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="March Newsletter"
              className={FIELD_CLASS}
            />
          </div>
        </GlowCard>

        {/* Content */}
        <GlowCard className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Content
            </h2>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {generating ? (
                <>
                  <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Generate with AI
                </>
              )}
            </button>
          </div>

          <div>
            <label htmlFor="subject" className={LABEL_CLASS}>
              Subject <span className="text-red-400">*</span>
            </label>
            <input
              id="subject"
              type="text"
              required
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Your subject line here"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="content" className={LABEL_CLASS}>
              Content
            </label>
            <textarea
              id="content"
              rows={8}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Email body content or HTML..."
              className={`${FIELD_CLASS} resize-y`}
            />
            <p className={HINT_CLASS}>
              Plain text or HTML. Template variables (&#123;&#123;name&#125;&#125;, etc.) are supported.
            </p>
          </div>
        </GlowCard>

        {/* Segmentation */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Segment Filter
          </h2>

          <div>
            <label htmlFor="segment_tags" className={LABEL_CLASS}>
              Tags
            </label>
            <input
              id="segment_tags"
              type="text"
              value={form.segment_tags}
              onChange={(e) => set("segment_tags", e.target.value)}
              placeholder="newsletter, vip, leads"
              className={FIELD_CLASS}
            />
            <p className={HINT_CLASS}>
              Comma-separated tags. Only contacts matching all tags will receive this campaign.
            </p>
          </div>

          <div>
            <label htmlFor="segment_engagement_min" className={LABEL_CLASS}>
              Minimum Engagement Score
            </label>
            <input
              id="segment_engagement_min"
              type="number"
              min={0}
              max={100}
              value={form.segment_engagement_min}
              onChange={(e) => set("segment_engagement_min", e.target.value)}
              placeholder="0"
              className={FIELD_CLASS}
            />
            <p className={HINT_CLASS}>
              Leave blank to include all contacts regardless of engagement.
            </p>
          </div>
        </GlowCard>

        {/* Schedule */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Schedule
          </h2>

          <div>
            <label htmlFor="scheduled_at" className={LABEL_CLASS}>
              Send At
            </label>
            <input
              id="scheduled_at"
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => set("scheduled_at", e.target.value)}
              className={FIELD_CLASS}
            />
            <p className={HINT_CLASS}>
              Leave blank to save as draft. Set a date/time to schedule for sending.
            </p>
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
            {submitting
              ? "Creating..."
              : form.scheduled_at
                ? "Schedule Campaign"
                : "Save Draft"}
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
