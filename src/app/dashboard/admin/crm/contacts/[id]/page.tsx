"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { ArrowLeft, Clock, CheckCircle2, DollarSign, Activity } from "lucide-react";

interface ContactRow {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  tags: string[];
  source: string | null;
  created_at: string;
}

interface ActivityRow {
  id: string;
  type: string;
  description: string;
  deal_id: string | null;
  created_at: string;
}

interface DealRow {
  id: string;
  title: string;
  stage: string;
  value: number | null;
  probability: number;
  won_at: string | null;
  lost_at: string | null;
}

interface TaskRow {
  id: string;
  title: string;
  due_at: string;
  status: string;
  overdue: boolean;
}

export default function AdminCrmContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { role } = useDashboard();

  const [contact, setContact] = useState<ContactRow | null>(null);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchData() {
      // Fetch timeline
      const [timelineRes, dealsRes, tasksRes] = await Promise.all([
        fetch(`/api/admin/crm/contacts/${id}/timeline`),
        fetch(`/api/admin/crm/deals`),
        fetch(`/api/admin/crm/tasks`),
      ]);

      if (timelineRes.ok) {
        const d = await timelineRes.json();
        setActivities(d.activities ?? []);
      }

      if (dealsRes.ok) {
        const d = await dealsRes.json();
        const filtered = (d.deals ?? []).filter(
          (deal: DealRow & { contact_id: string }) => deal.contact_id === id
        );
        setDeals(filtered);
      }

      if (tasksRes.ok) {
        const d = await tasksRes.json();
        const now = new Date().toISOString();
        const filtered = (d.tasks ?? []).filter(
          (task: TaskRow & { contact_id: string }) => task.contact_id === id
        ).map((task: TaskRow) => ({
          ...task,
          overdue: task.status === "pending" && task.due_at < now,
        }));
        setTasks(filtered);
      }

      // Try to get contact info from supabase via contacts API (we use email_contacts)
      // We'll derive contact info from the first activity or deal
      // Since we don't have a direct contacts detail API, fetch all and find by id
      setLoading(false);
    }

    fetchData();
  }, [id, role, router]);

  async function completeTask(taskId: string) {
    await fetch(`/api/admin/crm/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complete: true }),
    });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "completed", overdue: false } : t))
    );
  }

  if (role !== "admin") return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/admin/crm"
          className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Contact Detail</h1>
          <p className="text-foreground-muted text-sm mt-0.5 font-mono">{id}</p>
        </div>
      </div>

      {/* Info card */}
      <GlowCard className="p-5">
        <h2 className="text-sm font-semibold text-foreground-muted uppercase tracking-widest mb-3">
          Contact Info
        </h2>
        {contact ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-foreground-muted text-xs mb-0.5">Name</p>
              <p className="text-foreground">{contact.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-foreground-muted text-xs mb-0.5">Email</p>
              <p className="text-foreground">{contact.email}</p>
            </div>
            <div>
              <p className="text-foreground-muted text-xs mb-0.5">Phone</p>
              <p className="text-foreground">{contact.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-foreground-muted text-xs mb-0.5">Source</p>
              <p className="text-foreground capitalize">{contact.source ?? "—"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground-muted">
            Contact ID: <span className="font-mono">{id}</span>
          </p>
        )}
      </GlowCard>

      {/* Deals */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <DollarSign size={16} className="text-green-400" />
          Deals ({deals.length})
        </h2>
        {deals.length === 0 ? (
          <GlowCard className="px-5 py-8 text-center text-foreground-muted text-sm">
            No deals.
          </GlowCard>
        ) : (
          <GlowCard className="divide-y divide-white/5">
            {deals.map((deal) => (
              <div key={deal.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{deal.title}</p>
                  <p className="text-xs text-foreground-muted mt-0.5">{deal.stage} &middot; {deal.probability}%</p>
                </div>
                {deal.value != null && (
                  <p className="text-sm font-medium text-green-400">
                    ${deal.value.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </GlowCard>
        )}
      </div>

      {/* Tasks */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-blue-400" />
          Tasks ({tasks.length})
        </h2>
        {tasks.length === 0 ? (
          <GlowCard className="px-5 py-8 text-center text-foreground-muted text-sm">
            No tasks.
          </GlowCard>
        ) : (
          <GlowCard className="divide-y divide-white/5">
            {pendingTasks.map((task) => (
              <div key={task.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className={`text-xs mt-0.5 ${task.overdue ? "text-red-400" : "text-foreground-muted"}`}>
                    Due: {new Date(task.due_at).toLocaleDateString()}
                    {task.overdue && " (Overdue)"}
                  </p>
                </div>
                <button
                  onClick={() => completeTask(task.id)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                  Complete
                </button>
              </div>
            ))}
            {completedTasks.map((task) => (
              <div key={task.id} className="px-5 py-3 flex items-center gap-3 opacity-50">
                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                <p className="text-sm text-foreground line-through">{task.title}</p>
              </div>
            ))}
          </GlowCard>
        )}
      </div>

      {/* Activity timeline */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
          <Activity size={16} className="text-purple-400" />
          Activity Timeline ({activities.length})
        </h2>
        {activities.length === 0 ? (
          <GlowCard className="px-5 py-8 text-center text-foreground-muted text-sm">
            No activities recorded.
          </GlowCard>
        ) : (
          <GlowCard className="divide-y divide-white/5">
            {activities.map((activity) => (
              <div key={activity.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-foreground-muted mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-mono text-foreground-muted">{activity.type}</p>
                      <p className="text-sm text-foreground mt-0.5">{activity.description}</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground-dim whitespace-nowrap">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </GlowCard>
        )}
      </div>
    </div>
  );
}
