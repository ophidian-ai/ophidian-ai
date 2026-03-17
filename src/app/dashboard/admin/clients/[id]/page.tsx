"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ProjectPhaseTracker } from "@/components/ui/project-phase-tracker";
import {
  ArrowLeft,
  Building2,
  Mail,
  Globe,
  CreditCard,
  BarChart3,
  Search,
  Pencil,
  Check,
  X,
  Upload,
  User,
  Phone,
} from "lucide-react";
import type {
  Client,
  ClientService,
  Project,
  ProjectMilestone,
  Payment,
  ContentRequest,
  Report,
  ServiceType,
  ProjectPhase,
} from "@/lib/supabase/types";

const SERVICE_LABELS: Record<ServiceType, string> = {
  web_starter: "Web Starter",
  web_professional: "Web Professional",
  web_ecommerce: "Web E-Commerce",
  seo_cleanup: "SEO Cleanup",
  seo_growth: "SEO Growth",
  maintenance: "Maintenance",
  social_media: "Social Media",
};

const SERVICE_COLORS: Record<ServiceType, string> = {
  web_starter: "bg-green-500/15 text-green-400 border-green-500/30",
  web_professional: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  web_ecommerce: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  seo_cleanup: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  seo_growth: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  maintenance: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  social_media: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/15 text-green-400 border-green-500/30",
  completed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  paid: "bg-green-500/15 text-green-400 border-green-500/30",
  overdue: "bg-red-500/15 text-red-400 border-red-500/30",
  in_progress: "bg-teal-500/15 text-teal-400 border-teal-500/30",
};

interface EditableField {
  key: "ga4_property_id" | "search_console_url" | "stripe_customer_id";
  label: string;
  icon: typeof BarChart3;
}

const EDITABLE_FIELDS: EditableField[] = [
  { key: "ga4_property_id", label: "GA4 Property ID", icon: BarChart3 },
  { key: "search_console_url", label: "Search Console URL", icon: Search },
  { key: "stripe_customer_id", label: "Stripe Customer ID", icon: CreditCard },
];

export default function AdminClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const { role } = useDashboard();

  const [client, setClient] = useState<Client | null>(null);
  const [services, setServices] = useState<ClientService[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Record<string, ProjectMilestone[]>>({});
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contentRequests, setContentRequests] = useState<ContentRequest[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline edit state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchData() {
      const supabase = createClient();

      const [
        clientRes,
        servicesRes,
        projectRes,
        paymentsRes,
        contentRes,
        reportsRes,
      ] = await Promise.all([
        supabase.from("clients").select("*").eq("id", clientId).single(),
        supabase
          .from("client_services")
          .select("*")
          .eq("client_id", clientId)
          .order("started_at", { ascending: false }),
        supabase
          .from("projects")
          .select("*")
          .eq("client_id", clientId)
          .in("status", ["active", "launched"])
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false }),
        supabase
          .from("content_requests")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false }),
        supabase
          .from("reports")
          .select("*")
          .eq("client_id", clientId)
          .order("created_at", { ascending: false }),
      ]);

      setClient(clientRes.data as Client | null);
      setServices((servicesRes.data ?? []) as ClientService[]);
      const allProjects = (projectRes.data ?? []) as Project[];
      setProjects(allProjects);
      setPayments((paymentsRes.data ?? []) as Payment[]);
      setContentRequests((contentRes.data ?? []) as ContentRequest[]);
      setReports((reportsRes.data ?? []) as Report[]);

      // Fetch milestones for all projects
      if (allProjects.length > 0) {
        const projectIds = allProjects.map((p) => p.id);
        const { data: milestoneData } = await supabase
          .from("project_milestones")
          .select("*")
          .in("project_id", projectIds)
          .order("due_date", { ascending: true });
        const grouped: Record<string, ProjectMilestone[]> = {};
        for (const m of (milestoneData ?? []) as ProjectMilestone[]) {
          if (!grouped[m.project_id]) grouped[m.project_id] = [];
          grouped[m.project_id].push(m);
        }
        setMilestones(grouped);
      }

      setLoading(false);
    }

    fetchData();
  }, [role, router, clientId]);

  const handleMilestoneToggle = useCallback(
    async (milestoneId: string, projectId: string) => {
      const res = await fetch(`/api/admin/milestones/${milestoneId}/toggle`, {
        method: "PATCH",
      });

      if (res.ok) {
        const data = await res.json();
        setMilestones((prev) => ({
          ...prev,
          [projectId]: (prev[projectId] ?? []).map((m) =>
            m.id === milestoneId ? data.milestone : m
          ),
        }));
      }
    },
    []
  );

  const handlePhaseChange = useCallback(
    async (projectId: string, phase: ProjectPhase) => {
      const res = await fetch(`/api/admin/projects/${projectId}/phase`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase }),
      });

      if (res.ok) {
        const data = await res.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? data.project : p))
        );
      }
    },
    []
  );

  const activeProjects = projects.filter((p) => p.status === "active");
  const launchedProjects = projects.filter((p) => p.status === "launched");

  const handleInlineEdit = async (field: EditableField["key"]) => {
    if (!client) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("clients")
      .update({ [field]: editValue || null })
      .eq("id", client.id);

    if (!error) {
      setClient({ ...client, [field]: editValue || null });
    }

    setSaving(false);
    setEditingField(null);
    setEditValue("");
  };

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-foreground-muted">Client not found.</p>
        <GlassButton size="sm" href="/dashboard/admin/clients">
          Back to Clients
        </GlassButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/admin/clients")}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-foreground-muted" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {client.company_name}
          </h1>
          <p className="text-foreground-muted text-sm mt-0.5">
            Client since{" "}
            {new Date(client.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Client Info + Setup Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <GlowCard className="p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Client Information
          </h2>
          <dl className="space-y-3">
            {client.contact_name && (
              <div className="flex items-center gap-3">
                <User size={16} className="text-foreground-muted" />
                <dt className="text-sm text-foreground-muted w-24">Contact</dt>
                <dd className="text-sm text-foreground">{client.contact_name}</dd>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Building2 size={16} className="text-foreground-muted" />
              <dt className="text-sm text-foreground-muted w-24">Company</dt>
              <dd className="text-sm text-foreground">{client.company_name}</dd>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-foreground-muted" />
              <dt className="text-sm text-foreground-muted w-24">Email</dt>
              <dd className="text-sm text-foreground">
                {client.contact_email}
              </dd>
            </div>
            {client.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-foreground-muted" />
                <dt className="text-sm text-foreground-muted w-24">Phone</dt>
                <dd className="text-sm text-foreground">{client.phone}</dd>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-foreground-muted" />
              <dt className="text-sm text-foreground-muted w-24">Website</dt>
              <dd className="text-sm text-foreground">
                {client.website_url ? (
                  <a
                    href={client.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {client.website_url}
                  </a>
                ) : (
                  <span className="text-foreground-muted">Not set</span>
                )}
              </dd>
            </div>
          </dl>
        </GlowCard>

        {/* Setup Fields (inline editable) */}
        <GlowCard className="p-5">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Setup Configuration
          </h2>
          <dl className="space-y-3">
            {EDITABLE_FIELDS.map((field) => {
              const value = client[field.key];
              const isEditing = editingField === field.key;

              return (
                <div key={field.key} className="flex items-center gap-3">
                  <field.icon size={16} className="text-foreground-muted" />
                  <dt className="text-sm text-foreground-muted w-36 shrink-0">
                    {field.label}
                  </dt>
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-2 py-1 bg-surface/50 border border-white/20 rounded text-sm text-foreground focus:outline-none focus:border-primary/50"
                        autoFocus
                      />
                      <button
                        onClick={() => handleInlineEdit(field.key)}
                        disabled={saving}
                        className="p-1 text-green-400 hover:bg-green-400/10 rounded cursor-pointer"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingField(null);
                          setEditValue("");
                        }}
                        className="p-1 text-red-400 hover:bg-red-400/10 rounded cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <dd className="text-sm text-foreground truncate">
                        {value || (
                          <span className="text-foreground-muted">Not set</span>
                        )}
                      </dd>
                      <button
                        onClick={() => {
                          setEditingField(field.key);
                          setEditValue(value ?? "");
                        }}
                        className="p-1 text-foreground-muted hover:text-foreground hover:bg-white/5 rounded cursor-pointer shrink-0"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </dl>
        </GlowCard>
      </div>

      {/* Services */}
      <GlowCard className="p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Active Services
        </h2>
        {services.length === 0 ? (
          <p className="text-foreground-muted text-sm">No services.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <span
                key={s.id}
                className={`text-sm px-3 py-1 rounded-full border ${SERVICE_COLORS[s.service_type]}`}
              >
                {SERVICE_LABELS[s.service_type]}
                <span className="ml-2 opacity-60 capitalize">{s.status}</span>
              </span>
            ))}
          </div>
        )}
      </GlowCard>

      {/* Active Projects */}
      {activeProjects.map((proj) => (
        <div key={proj.id} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Project Progress — {proj.name ?? "Active Project"}
            </h2>
            <ProjectPhaseTracker
              currentPhase={proj.phase}
              editable
              onPhaseChange={(phase) => handlePhaseChange(proj.id, phase)}
            />
          </div>

          {(milestones[proj.id] ?? []).length > 0 && (
            <GlowCard className="p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Milestones
              </h2>
              <div className="space-y-3">
                {(milestones[proj.id] ?? []).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start gap-3 cursor-pointer group"
                    onClick={() => handleMilestoneToggle(m.id, proj.id)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          m.completed_at
                            ? "bg-accent/20 border-accent"
                            : "border-white/30 group-hover:border-white/50"
                        }`}
                      >
                        {m.completed_at && (
                          <Check size={12} className="text-accent" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-medium ${
                            m.completed_at
                              ? "text-foreground"
                              : "text-foreground-dim"
                          }`}
                        >
                          {m.title}
                        </span>
                        <span className="text-xs text-foreground-muted capitalize">
                          {m.phase}
                        </span>
                        {m.completed_at && (
                          <span className="text-xs text-accent px-2 py-0.5 rounded-full bg-accent/10">
                            Complete
                          </span>
                        )}
                      </div>
                      {m.description && (
                        <p className="text-xs text-foreground-dim mt-1">
                          {m.description}
                        </p>
                      )}
                      {m.due_date && (
                        <p className="text-xs text-foreground-muted mt-1">
                          Due: {new Date(m.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          )}
        </div>
      ))}

      {/* Launched Projects */}
      {launchedProjects.map((proj) => (
        <GlowCard key={proj.id} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              {proj.name ?? "Launched Project"}
            </h2>
            <span
              className={`text-xs px-3 py-1 rounded-full border font-medium ${
                proj.phase === "maintenance"
                  ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  : "bg-green-500/15 text-green-400 border-green-500/30"
              }`}
            >
              {proj.phase === "maintenance" ? "Maintenance" : "Live"}
            </span>
          </div>
          <ProjectPhaseTracker
            currentPhase={proj.phase}
            editable
            onPhaseChange={(phase) => handlePhaseChange(proj.id, phase)}
          />
        </GlowCard>
      ))}

      {/* Payment History */}
      <GlowCard className="p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Payment History
        </h2>
        {payments.length === 0 ? (
          <p className="text-foreground-muted text-sm">No payments recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase">
                    Milestone
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase">
                    Amount
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase">
                    Due Date
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-foreground-muted uppercase">
                    Paid
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/5"
                  >
                    <td className="px-4 py-3 text-sm text-foreground capitalize">
                      {p.milestone_label}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      ${p.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[p.status] ?? ""}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-muted">
                      {p.due_date
                        ? new Date(p.due_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-muted">
                      {p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlowCard>

      {/* Content Requests */}
      <GlowCard className="p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Content Requests
        </h2>
        {contentRequests.length === 0 ? (
          <p className="text-foreground-muted text-sm">
            No content requests yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {contentRequests.map((cr) => (
              <li
                key={cr.id}
                className="flex items-center justify-between border-b border-white/5 pb-3"
              >
                <div>
                  <p className="text-sm text-foreground">{cr.subject}</p>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {new Date(cr.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[cr.status] ?? ""}`}
                >
                  {cr.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlowCard>

      {/* Reports */}
      <GlowCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Reports</h2>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground-muted hover:text-foreground border border-white/10 hover:border-white/20 rounded-lg transition-colors cursor-pointer">
            <Upload size={14} />
            Upload Report
          </button>
        </div>
        {reports.length === 0 ? (
          <p className="text-foreground-muted text-sm">No reports yet.</p>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between border-b border-white/5 pb-3"
              >
                <div>
                  <p className="text-sm text-foreground">{r.title}</p>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    {new Date(r.period_start).toLocaleDateString()} -{" "}
                    {new Date(r.period_end).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </GlowCard>
    </div>
  );
}
