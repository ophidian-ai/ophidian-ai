"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  ArrowLeft,
  MessageSquare,
  Users,
  BarChart3,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
} from "lucide-react";
import type { ChatbotConfig, ChatbotLead, ChatbotConversation } from "@/lib/supabase/types";

interface ConfigWithClient extends ChatbotConfig {
  clients: { company_name: string } | null;
}

interface Analytics {
  conversations_30d: number;
  messages_30d: number;
  leads_30d: number;
  avg_messages: number;
}

interface DetailData {
  config: ConfigWithClient;
  analytics: Analytics;
  recentLeads: ChatbotLead[];
  recentConversations: ChatbotConversation[];
}

const TIER_COLORS: Record<string, string> = {
  essentials: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  growth: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pro: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatbotConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { role } = useDashboard();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchDetail() {
      const res = await fetch(`/api/admin/chatbot/configs/${id}`);
      if (res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
      setLoading(false);
    }

    fetchDetail();
  }, [id, role, router]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/chatbot/configs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard/admin/chatbot");
      }
    } finally {
      setDeleting(false);
    }
  }

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-foreground-muted">Config not found.</p>
        <Link href="/dashboard/admin/chatbot" className="text-primary text-sm hover:underline">
          Back to Chatbot
        </Link>
      </div>
    );
  }

  const { config, analytics, recentLeads, recentConversations } = data;

  const statCards = [
    {
      label: "Conversations (30d)",
      value: analytics.conversations_30d.toLocaleString(),
      icon: MessageSquare,
      color: "#C4A265",
    },
    {
      label: "Messages (30d)",
      value: analytics.messages_30d.toLocaleString(),
      icon: BarChart3,
      color: "#7A9E7E",
    },
    {
      label: "Leads Captured (30d)",
      value: analytics.leads_30d.toLocaleString(),
      icon: Users,
      color: "#D4B87A",
    },
    {
      label: "Avg. Messages / Conv.",
      value: analytics.avg_messages.toFixed(1),
      icon: BarChart3,
      color: "#9B8EC4",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground font-mono">
                {config.slug}
              </h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                  TIER_COLORS[config.tier] ?? ""
                }`}
              >
                {config.tier}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  config.active
                    ? "bg-green-500/15 text-green-400 border-green-500/30"
                    : "bg-gray-500/15 text-gray-400 border-gray-500/30"
                }`}
              >
                {config.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-foreground-muted text-sm mt-0.5">
              {config.clients?.company_name ?? "Unassigned"} &mdash; created{" "}
              {formatDate(config.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-400">Are you sure?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-foreground-muted border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
          <GlassButton size="sm" href={`/dashboard/admin/chatbot/${id}/edit`}>
            <span className="flex items-center gap-2">
              <Edit size={16} />
              Edit Config
            </span>
          </GlassButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <GlowCard key={card.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon size={20} style={{ color: card.color }} />
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Config Info */}
      <GlowCard className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Configuration
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">Model</p>
            <p className="text-foreground font-mono">{config.model}</p>
          </div>
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              Lead Capture
            </p>
            <div className="flex items-center gap-1.5">
              {config.lead_capture.enabled ? (
                <CheckCircle size={14} className="text-green-400" />
              ) : (
                <XCircle size={14} className="text-gray-400" />
              )}
              <span className="text-foreground">
                {config.lead_capture.enabled
                  ? `${config.lead_capture.mode} (after ${config.lead_capture.trigger_after})`
                  : "Disabled"}
              </span>
            </div>
          </div>
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              Fallback Phone
            </p>
            <div className="flex items-center gap-1.5">
              <Phone size={14} className="text-foreground-muted" />
              <span className="text-foreground">
                {config.fallback_contact.phone ?? "-"}
              </span>
            </div>
          </div>
          <div>
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              Fallback Email
            </p>
            <div className="flex items-center gap-1.5">
              <Mail size={14} className="text-foreground-muted" />
              <span className="text-foreground">
                {config.fallback_contact.email ?? "-"}
              </span>
            </div>
          </div>
          <div className="sm:col-span-2">
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              Allowed Origins
            </p>
            <p className="text-foreground font-mono text-xs">
              {config.allowed_origins.length > 0
                ? config.allowed_origins.join(", ")
                : "All origins allowed"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              Greeting
            </p>
            <p className="text-foreground">{config.greeting}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-foreground-muted text-xs uppercase tracking-wider mb-1">
              System Prompt
            </p>
            <p className="text-foreground text-sm whitespace-pre-wrap bg-surface/30 border border-white/5 rounded-lg p-3 max-h-40 overflow-y-auto">
              {config.system_prompt}
            </p>
          </div>
        </div>
      </GlowCard>

      {/* Recent Leads and Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Recent Leads</h2>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-foreground-muted text-sm">No leads captured yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentLeads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {lead.name ?? "Anonymous"}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {lead.email && (
                        <span className="flex items-center gap-1 text-xs text-foreground-muted">
                          <Mail size={11} />
                          {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1 text-xs text-foreground-muted">
                          <Phone size={11} />
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-foreground-muted shrink-0">
                    {formatDate(lead.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlowCard>

        {/* Recent Conversations */}
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Recent Conversations
            </h2>
          </div>
          {recentConversations.length === 0 ? (
            <p className="text-foreground-muted text-sm">No conversations yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentConversations.map((conv) => (
                <li
                  key={conv.id}
                  className="flex items-center justify-between pb-3 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare size={13} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        {conv.message_count} message{conv.message_count !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {conv.page_url
                          ? new URL(conv.page_url).pathname
                          : "Unknown page"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {conv.lead_captured && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/30">
                        Lead
                      </span>
                    )}
                    <span className="text-xs text-foreground-muted">
                      {formatDateTime(conv.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlowCard>
      </div>
    </div>
  );
}
