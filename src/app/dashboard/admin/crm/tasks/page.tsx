"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/lib/dashboard-context";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GlassButton } from "@/components/ui/glass-button";
import { CheckCircle2, AlertCircle, Clock, CalendarDays, Plus } from "lucide-react";

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  due_at: string;
  status: string;
  overdue: boolean;
  config_id: string;
  contact_id: string | null;
}

function isTodayTask(task: TaskRow): boolean {
  const due = new Date(task.due_at);
  const now = new Date();
  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate()
  );
}

export default function AdminCrmTasksPage() {
  const router = useRouter();
  const { role } = useDashboard();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function fetchTasks() {
      const res = await fetch("/api/admin/crm/tasks");
      if (res.ok) {
        const d = await res.json();
        setTasks(d.tasks ?? []);
      }
      setLoading(false);
    }

    fetchTasks();
  }, [role, router]);

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

  const pending = tasks.filter((t) => t.status === "pending");
  const overdue = pending.filter((t) => t.overdue);
  const today = pending.filter((t) => !t.overdue && isTodayTask(t));
  const upcoming = pending.filter((t) => !t.overdue && !isTodayTask(t));

  function TaskList({
    tasks: list,
    emptyMessage,
  }: {
    tasks: TaskRow[];
    emptyMessage: string;
  }) {
    if (list.length === 0) {
      return (
        <p className="text-sm text-foreground-muted px-5 py-4">{emptyMessage}</p>
      );
    }
    return (
      <div className="divide-y divide-white/5">
        {list.map((task) => (
          <div
            key={task.id}
            className="px-5 py-3 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0">
                {task.overdue ? (
                  <AlertCircle size={14} className="text-red-400" />
                ) : isTodayTask(task) ? (
                  <CalendarDays size={14} className="text-yellow-400" />
                ) : (
                  <Clock size={14} className="text-foreground-muted" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-foreground-muted mt-0.5">{task.description}</p>
                )}
                <p
                  className={`text-xs mt-1 ${
                    task.overdue
                      ? "text-red-400"
                      : isTodayTask(task)
                      ? "text-yellow-400"
                      : "text-foreground-dim"
                  }`}
                >
                  Due: {new Date(task.due_at).toLocaleDateString()}
                  {task.overdue && " — Overdue"}
                </p>
              </div>
            </div>
            <button
              onClick={() => completeTask(task.id)}
              className="text-xs text-primary hover:text-primary/80 transition-colors whitespace-nowrap cursor-pointer"
            >
              Complete
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CRM Tasks</h1>
          <p className="text-foreground-muted text-sm mt-1">
            {pending.length} pending &middot; {overdue.length} overdue
          </p>
        </div>
        <GlassButton size="sm" href="/dashboard/admin/crm">
          <span className="flex items-center gap-2">
            <Plus size={16} />
            Back to CRM
          </span>
        </GlassButton>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
            <AlertCircle size={14} />
            Overdue ({overdue.length})
          </h2>
          <GlowCard className="overflow-hidden">
            <TaskList tasks={overdue} emptyMessage="" />
          </GlowCard>
        </div>
      )}

      {/* Today */}
      <div>
        <h2 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <CalendarDays size={14} />
          Due Today ({today.length})
        </h2>
        <GlowCard className="overflow-hidden">
          <TaskList tasks={today} emptyMessage="Nothing due today." />
        </GlowCard>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-sm font-semibold text-foreground-muted mb-2 flex items-center gap-2">
          <Clock size={14} />
          Upcoming ({upcoming.length})
        </h2>
        <GlowCard className="overflow-hidden">
          <TaskList tasks={upcoming} emptyMessage="No upcoming tasks." />
        </GlowCard>
      </div>

      {/* Completed (collapsed summary) */}
      {tasks.filter((t) => t.status === "completed").length > 0 && (
        <div>
          <p className="text-xs text-foreground-dim flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-green-400" />
            {tasks.filter((t) => t.status === "completed").length} completed tasks hidden
          </p>
        </div>
      )}
    </div>
  );
}
