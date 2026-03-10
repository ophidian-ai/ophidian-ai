"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ProjectPhaseTracker } from "@/components/ui/project-phase-tracker";
import type { ProjectPhase } from "@/lib/supabase/types";

interface AdminProject {
  id: string;
  client_id: string;
  status: string;
  phase: ProjectPhase;
  phase_updated_at: string;
  estimated_completion: string | null;
  notes: string | null;
  created_at: string;
  name?: string;
  clients: { id: string; company_name: string | null; name: string } | null;
  client_services: { service_type: string } | null;
}

interface ProjectMilestone {
  id: string;
  project_id: string;
  phase: ProjectPhase;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [milestones, setMilestones] = useState<Record<string, ProjectMilestone[]>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "all">("active");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      let query = supabase
        .from("projects")
        .select("*, clients(id, company_name, name), client_services(service_type)")
        .order("phase_updated_at", { ascending: false });

      if (filter === "active") {
        query = query.eq("status", "active");
      }

      const { data: projectData } = await query;

      if (projectData && projectData.length > 0) {
        setProjects(projectData as AdminProject[]);

        const projectIds = projectData.map((p) => p.id);
        const { data: milestoneData } = await supabase
          .from("project_milestones")
          .select("*")
          .in("project_id", projectIds)
          .order("due_date", { ascending: true });

        if (milestoneData) {
          const grouped: Record<string, ProjectMilestone[]> = {};
          for (const m of milestoneData) {
            if (!grouped[m.project_id]) grouped[m.project_id] = [];
            grouped[m.project_id].push(m);
          }
          setMilestones(grouped);
        }
      } else {
        setProjects([]);
        setMilestones({});
      }

      setLoading(false);
    }

    setLoading(true);
    fetchData();
  }, [filter]);

  function handlePhaseChange(projectId: string, newPhase: ProjectPhase) {
    const supabase = createClient();
    supabase
      .from("projects")
      .update({ phase: newPhase, phase_updated_at: new Date().toISOString() })
      .eq("id", projectId)
      .then(() => {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? { ...p, phase: newPhase, phase_updated_at: new Date().toISOString() }
              : p
          )
        );
      });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Active Projects</h1>
        <div className="glass rounded-xl border border-primary/10 p-6 animate-pulse">
          <div className="h-6 w-48 bg-white/5 rounded" />
          <div className="h-32 w-full bg-white/5 rounded mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Active Projects</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "active"
                ? "bg-primary/10 text-primary"
                : "text-foreground-muted hover:text-foreground hover:bg-white/5"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-primary/10 text-primary"
                : "text-foreground-muted hover:text-foreground hover:bg-white/5"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="glass rounded-xl border border-primary/10 p-12 text-center">
          <p className="text-foreground-dim">
            {filter === "active" ? "No active projects." : "No projects found."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => {
            const clientName =
              project.clients?.company_name || project.clients?.name || "Unknown Client";
            const serviceLabel = project.client_services?.service_type
              ?.replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());

            return (
              <div
                key={project.id}
                className="glass rounded-xl border border-primary/10 p-6 space-y-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/dashboard/admin/clients/${project.client_id}`}
                      className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {clientName}
                    </Link>
                    <div className="flex items-center gap-3 mt-1">
                      {serviceLabel && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {serviceLabel}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          project.status === "active"
                            ? "bg-accent/10 text-accent"
                            : project.status === "completed"
                            ? "bg-primary/10 text-primary"
                            : "bg-white/10 text-foreground-dim"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-foreground-dim">
                    {project.estimated_completion && (
                      <div>
                        Est.{" "}
                        {new Date(project.estimated_completion).toLocaleDateString()}
                      </div>
                    )}
                    <div className="text-xs mt-1">
                      Updated{" "}
                      {new Date(project.phase_updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Phase Tracker -- editable for admin */}
                <ProjectPhaseTracker
                  currentPhase={project.phase}
                  editable
                  onPhaseChange={(phase) => handlePhaseChange(project.id, phase)}
                />

                {/* Notes */}
                {project.notes && (
                  <p className="text-sm text-foreground-dim">{project.notes}</p>
                )}

                {/* Milestones */}
                {milestones[project.id] && milestones[project.id].length > 0 && (
                  <div className="border-t border-white/5 pt-4">
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      Milestones
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {milestones[project.id].map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              milestone.completed_at
                                ? "bg-accent"
                                : "bg-white/20"
                            }`}
                          />
                          <div>
                            <span
                              className={
                                milestone.completed_at
                                  ? "text-foreground"
                                  : "text-foreground-dim"
                              }
                            >
                              {milestone.title}
                            </span>
                            {milestone.due_date && (
                              <span className="text-xs text-foreground-dim ml-2">
                                {new Date(milestone.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
