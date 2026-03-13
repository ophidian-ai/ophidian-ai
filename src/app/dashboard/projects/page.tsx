"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/lib/dashboard-context";
import { ModuleGuard } from "@/components/dashboard/module-guard";
import { ProjectPhaseTracker } from "@/components/ui/project-phase-tracker";
import { createClient } from "@/lib/supabase/client";
import type { Project, ProjectMilestone } from "@/lib/supabase/types";

export default function ProjectsPage() {
  const { modules, clientId } = useDashboard();

  return (
    <ModuleGuard modules={modules} required="project_tracker">
      <ProjectsContent clientId={clientId} />
    </ModuleGuard>
  );
}

function ProjectsContent({ clientId }: { clientId: string | null }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Record<string, ProjectMilestone[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    async function fetchData() {
      const supabase = createClient();

      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", clientId)
        .in("status", ["active", "launched"])
        .order("created_at", { ascending: false });

      if (projectData && projectData.length > 0) {
        setProjects(projectData);

        const projectIds = projectData.map((p: Project) => p.id);
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
      }

      setLoading(false);
    }

    fetchData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <div className="glass rounded-xl border border-primary/10 p-6 animate-pulse">
          <div className="h-6 w-48 bg-white/5 rounded" />
          <div className="h-32 w-full bg-white/5 rounded mt-4" />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <div className="glass rounded-xl border border-primary/10 p-12 text-center">
          <div className="text-foreground-dim text-4xl mb-4">--</div>
          <p className="text-foreground-dim">
            No active projects. Your project details will appear here once your
            project begins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Projects</h1>

      {projects.map((project) => (
        <div key={project.id} className="space-y-6">
          {/* Phase Tracker */}
          <ProjectPhaseTracker currentPhase={project.phase} />

          {/* Project Details */}
          <div className="glass rounded-xl border border-primary/10 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Project Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-foreground-dim">Status</span>
                <p className="text-foreground capitalize">{project.status}</p>
              </div>
              <div>
                <span className="text-sm text-foreground-dim">
                  Current Phase
                </span>
                <p className="text-foreground capitalize">{project.phase}</p>
              </div>
              {project.estimated_completion && (
                <div>
                  <span className="text-sm text-foreground-dim">
                    Estimated Completion
                  </span>
                  <p className="text-foreground">
                    {new Date(project.estimated_completion).toLocaleDateString()}
                  </p>
                </div>
              )}
              {project.notes && (
                <div className="sm:col-span-2">
                  <span className="text-sm text-foreground-dim">Notes</span>
                  <p className="text-foreground">{project.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Milestone Timeline */}
          {milestones[project.id] && milestones[project.id].length > 0 && (
            <div className="glass rounded-xl border border-primary/10 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Milestones
              </h2>
              <div className="space-y-4">
                {milestones[project.id].map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-4 relative"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          milestone.completed_at
                            ? "bg-accent"
                            : "bg-white/20 border border-white/30"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-medium ${
                            milestone.completed_at
                              ? "text-foreground"
                              : "text-foreground-dim"
                          }`}
                        >
                          {milestone.title}
                        </span>
                        {milestone.completed_at && (
                          <span className="text-xs text-accent px-2 py-0.5 rounded-full bg-accent/10">
                            Complete
                          </span>
                        )}
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-foreground-dim mt-1">
                          {milestone.description}
                        </p>
                      )}
                      {milestone.due_date && (
                        <p className="text-xs text-foreground-dim mt-1">
                          Due:{" "}
                          {new Date(milestone.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
