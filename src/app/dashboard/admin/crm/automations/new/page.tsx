"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

interface ConfigOption {
  id: string;
  tier: string;
  clients: { company_name: string } | null;
}

const TRIGGER_TYPES = [
  { value: "deal_stage_change", label: "Deal Stage Changed" },
  { value: "deal_won", label: "Deal Won" },
  { value: "deal_lost", label: "Deal Lost" },
  { value: "contact_created", label: "Contact Created" },
  { value: "email_opened", label: "Email Opened" },
  { value: "email_clicked", label: "Email Clicked" },
];

const ACTION_TYPES = [
  { value: "enroll_sequence", label: "Enroll in Email Sequence" },
  { value: "create_task", label: "Create Task" },
  { value: "send_notification", label: "Send Notification" },
  { value: "update_deal", label: "Update Deal Stage" },
];

function getTriggerPreview(triggerType: string, triggerConfig: Record<string, string>): string {
  switch (triggerType) {
    case "deal_stage_change":
      return triggerConfig.stage
        ? `When a deal moves to stage "${triggerConfig.stage}"`
        : "When a deal changes stage";
    case "deal_won":
      return "When a deal is won";
    case "deal_lost":
      return "When a deal is lost";
    case "contact_created":
      return "When a new contact is created";
    case "email_opened":
      return "When a contact opens an email";
    case "email_clicked":
      return "When a contact clicks an email link";
    default:
      return triggerType;
  }
}

function getActionPreview(actionType: string, actionConfig: Record<string, string>): string {
  switch (actionType) {
    case "enroll_sequence":
      return actionConfig.sequence_id
        ? `Enroll in sequence "${actionConfig.sequence_id}"`
        : "Enroll in an email sequence";
    case "create_task":
      return actionConfig.title
        ? `Create task: "${actionConfig.title}"`
        : "Create a follow-up task";
    case "send_notification":
      return actionConfig.subject
        ? `Send notification: "${actionConfig.subject}"`
        : "Send an email notification";
    case "update_deal":
      return actionConfig.stage
        ? `Move deal to stage "${actionConfig.stage}"`
        : "Update deal stage";
    default:
      return actionType;
  }
}

export default function NewAutomationPage() {
  const router = useRouter();
  const { role } = useDashboard();

  const [configs, setConfigs] = useState<ConfigOption[]>([]);
  const [configId, setConfigId] = useState("");
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("deal_stage_change");
  const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>({});
  const [actionType, setActionType] = useState("create_task");
  const [actionConfig, setActionConfig] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchConfigs() {
      const res = await fetch("/api/admin/crm/configs");
      if (res.ok) {
        const d = await res.json();
        const proConfigs = (d.configs ?? []).filter(
          (c: ConfigOption) => c.tier === "pro"
        );
        setConfigs(proConfigs);
        if (proConfigs.length > 0) {
          setConfigId(proConfigs[0].id);
        }
      }
    }

    fetchConfigs();
  }, [role, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/crm/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config_id: configId,
        name,
        trigger_type: triggerType,
        trigger_config: triggerConfig,
        action_type: actionType,
        action_config: actionConfig,
        active: true,
      }),
    });

    if (res.ok) {
      const d = await res.json();
      router.push(`/dashboard/admin/crm/${configId}`);
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to create automation");
      setSubmitting(false);
    }
  }

  if (role !== "admin") return null;

  const previewText = name
    ? `"${name}": ${getTriggerPreview(triggerType, triggerConfig)} → ${getActionPreview(actionType, actionConfig)}`
    : null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/crm"
          className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap size={20} className="text-yellow-400" />
            New Automation
          </h1>
          <p className="text-foreground-muted text-sm mt-0.5">Pro tier required.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Config select */}
        <GlowCard className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Client (Pro configs only)
            </label>
            <select
              value={configId}
              onChange={(e) => setConfigId(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {configs.length === 0 && (
                <option value="">No Pro configs available</option>
              )}
              {configs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.clients?.company_name ?? c.id}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Automation Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Follow up after proposal sent"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </GlowCard>

        {/* Trigger */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Trigger</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Trigger Type
            </label>
            <select
              value={triggerType}
              onChange={(e) => {
                setTriggerType(e.target.value);
                setTriggerConfig({});
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {TRIGGER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {triggerType === "deal_stage_change" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                Stage (leave blank to match any)
              </label>
              <input
                type="text"
                value={triggerConfig.stage ?? ""}
                onChange={(e) =>
                  setTriggerConfig((prev) => ({ ...prev, stage: e.target.value }))
                }
                placeholder="e.g., Proposal"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          )}
        </GlowCard>

        {/* Action */}
        <GlowCard className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Action</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Action Type
            </label>
            <select
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value);
                setActionConfig({});
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              {ACTION_TYPES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {actionType === "create_task" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Task Title
                </label>
                <input
                  type="text"
                  value={actionConfig.title ?? ""}
                  onChange={(e) =>
                    setActionConfig((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Follow up with client"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Delay (hours)
                </label>
                <input
                  type="number"
                  min="0"
                  value={actionConfig.delay_hours ?? "24"}
                  onChange={(e) =>
                    setActionConfig((prev) => ({ ...prev, delay_hours: e.target.value }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </>
          )}

          {actionType === "enroll_sequence" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                Sequence ID
              </label>
              <input
                type="text"
                value={actionConfig.sequence_id ?? ""}
                onChange={(e) =>
                  setActionConfig((prev) => ({ ...prev, sequence_id: e.target.value }))
                }
                placeholder="Sequence UUID"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          )}

          {actionType === "send_notification" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  value={actionConfig.subject ?? ""}
                  onChange={(e) =>
                    setActionConfig((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  placeholder="Notification subject"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  Body
                </label>
                <textarea
                  value={actionConfig.body ?? ""}
                  onChange={(e) =>
                    setActionConfig((prev) => ({ ...prev, body: e.target.value }))
                  }
                  rows={3}
                  placeholder="Notification body"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>
            </>
          )}

          {actionType === "update_deal" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                Target Stage
              </label>
              <input
                type="text"
                value={actionConfig.stage ?? ""}
                onChange={(e) =>
                  setActionConfig((prev) => ({ ...prev, stage: e.target.value }))
                }
                placeholder="e.g., Won"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground-dim focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          )}
        </GlowCard>

        {/* Preview */}
        {previewText && (
          <GlowCard className="p-4">
            <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Preview</p>
            <p className="text-sm text-foreground">{previewText}</p>
          </GlowCard>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex gap-3">
          <GlassButton type="submit" disabled={submitting || !configId || !name}>
            {submitting ? "Creating..." : "Create Automation"}
          </GlassButton>
          <Link
            href="/dashboard/admin/crm"
            className="px-4 py-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
