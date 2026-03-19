"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

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

interface SequenceStep {
  order: number;
  template_id: string;
  delay_hours: number;
  condition: { type: string; step: number } | null;
}

type TriggerType = "product_event" | "time_based" | "api_trigger";

interface FormState {
  config_id: string;
  name: string;
  trigger_type: TriggerType;
  trigger_event: string;
  trigger_delay_hours: string;
  trigger_api_key: string;
}

const INITIAL_FORM: FormState = {
  config_id: "",
  name: "",
  trigger_type: "product_event",
  trigger_event: "",
  trigger_delay_hours: "",
  trigger_api_key: "",
};

const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: "product_event", label: "Product Event" },
  { value: "time_based", label: "Time Based" },
  { value: "api_trigger", label: "API Trigger" },
];

const CONDITION_OPTIONS = [
  { value: "", label: "No condition" },
  { value: "opened", label: "Opened previous step" },
  { value: "clicked", label: "Clicked previous step" },
  { value: "not_opened", label: "Did not open previous step" },
];

const FIELD_CLASS =
  "w-full px-3 py-2 bg-surface/50 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary/50";

const LABEL_CLASS = "block text-sm font-medium text-foreground mb-1.5";

const HINT_CLASS = "mt-1 text-xs text-foreground-muted";

function buildTriggerConfig(form: FormState): Record<string, unknown> {
  if (form.trigger_type === "product_event") {
    return { event: form.trigger_event.trim() };
  }
  if (form.trigger_type === "time_based") {
    return { delay_hours: Number(form.trigger_delay_hours) || 0 };
  }
  if (form.trigger_type === "api_trigger") {
    return { api_key: form.trigger_api_key.trim() };
  }
  return {};
}

export default function NewSequencePage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [configs, setConfigs] = useState<EmailConfigOption[]>([]);
  const [templates, setTemplates] = useState<EmailTemplateOption[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [steps, setSteps] = useState<SequenceStep[]>([
    { order: 1, template_id: "", delay_hours: 0, condition: null },
  ]);
  const [submitting, setSubmitting] = useState(false);
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

  function setField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { order: prev.length + 1, template_id: "", delay_hours: 24, condition: null },
    ]);
  }

  function removeStep(index: number) {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i + 1 }))
    );
  }

  function updateStep(index: number, field: keyof SequenceStep, value: unknown) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function updateStepCondition(index: number, conditionType: string, conditionStep: number) {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? {
              ...s,
              condition:
                conditionType
                  ? { type: conditionType, step: conditionStep }
                  : null,
            }
          : s
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      config_id: form.config_id,
      name: form.name.trim(),
      trigger_type: form.trigger_type,
      trigger_config: buildTriggerConfig(form),
      steps: steps.map((s) => ({
        order: s.order,
        template_id: s.template_id || null,
        delay_hours: s.delay_hours,
        condition: s.condition,
      })),
    };

    const res = await fetch("/api/admin/email/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/dashboard/admin/email/${form.config_id}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create sequence. Please try again.");
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
          <h1 className="text-2xl font-bold text-foreground">New Sequence</h1>
          <p className="text-foreground-muted text-sm mt-0.5">
            Build an automated email sequence
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
            <label htmlFor="config_id" className={LABEL_CLASS}>
              Client Config <span className="text-red-400">*</span>
            </label>
            <select
              id="config_id"
              required
              value={form.config_id}
              onChange={(e) => setField("config_id", e.target.value)}
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
            <label htmlFor="name" className={LABEL_CLASS}>
              Sequence Name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Welcome Series"
              className={FIELD_CLASS}
            />
          </div>
        </GlowCard>

        {/* Trigger */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Trigger
          </h2>

          <div>
            <label htmlFor="trigger_type" className={LABEL_CLASS}>
              Trigger Type <span className="text-red-400">*</span>
            </label>
            <select
              id="trigger_type"
              required
              value={form.trigger_type}
              onChange={(e) => setField("trigger_type", e.target.value as TriggerType)}
              className={FIELD_CLASS}
            >
              {TRIGGER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {form.trigger_type === "product_event" && (
            <div>
              <label htmlFor="trigger_event" className={LABEL_CLASS}>
                Event Name <span className="text-red-400">*</span>
              </label>
              <input
                id="trigger_event"
                type="text"
                required
                value={form.trigger_event}
                onChange={(e) => setField("trigger_event", e.target.value)}
                placeholder="user.signup"
                className={FIELD_CLASS}
              />
              <p className={HINT_CLASS}>
                The event name that triggers enrollment in this sequence.
              </p>
            </div>
          )}

          {form.trigger_type === "time_based" && (
            <div>
              <label htmlFor="trigger_delay_hours" className={LABEL_CLASS}>
                Delay After Signup (hours) <span className="text-red-400">*</span>
              </label>
              <input
                id="trigger_delay_hours"
                type="number"
                required
                min={0}
                value={form.trigger_delay_hours}
                onChange={(e) => setField("trigger_delay_hours", e.target.value)}
                placeholder="0"
                className={FIELD_CLASS}
              />
            </div>
          )}

          {form.trigger_type === "api_trigger" && (
            <div>
              <label htmlFor="trigger_api_key" className={LABEL_CLASS}>
                API Key Identifier
              </label>
              <input
                id="trigger_api_key"
                type="text"
                value={form.trigger_api_key}
                onChange={(e) => setField("trigger_api_key", e.target.value)}
                placeholder="my-integration-key"
                className={FIELD_CLASS}
              />
              <p className={HINT_CLASS}>
                Used to identify which API trigger activates this sequence.
              </p>
            </div>
          )}
        </GlowCard>

        {/* Steps */}
        <GlowCard className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Steps
            </h2>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <Plus size={13} />
              Add Step
            </button>
          </div>

          {steps.length === 0 && (
            <p className="text-foreground-muted text-sm">
              No steps yet. Add at least one step.
            </p>
          )}

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.order}
                className="border border-white/10 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                    Step {step.order}
                  </span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-1 rounded text-foreground-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div>
                  <label className={LABEL_CLASS}>Template</label>
                  <select
                    value={step.template_id}
                    onChange={(e) => updateStep(index, "template_id", e.target.value)}
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
                  <label className={LABEL_CLASS}>Delay (hours after previous step)</label>
                  <input
                    type="number"
                    min={0}
                    value={step.delay_hours}
                    onChange={(e) =>
                      updateStep(index, "delay_hours", Number(e.target.value))
                    }
                    className={FIELD_CLASS}
                  />
                </div>

                {index > 0 && (
                  <div>
                    <label className={LABEL_CLASS}>Condition</label>
                    <select
                      value={step.condition?.type ?? ""}
                      onChange={(e) =>
                        updateStepCondition(index, e.target.value, index)
                      }
                      className={FIELD_CLASS}
                    >
                      {CONDITION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className={HINT_CLASS}>
                      Optional: only send this step if the condition is met on the previous step.
                    </p>
                  </div>
                )}
              </div>
            ))}
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
            {submitting ? "Creating..." : "Create Sequence"}
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
