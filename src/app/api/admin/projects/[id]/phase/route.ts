import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import type { ProjectPhase } from "@/lib/supabase/types";

const VALID_PHASES: ProjectPhase[] = [
  "discovery",
  "design",
  "development",
  "review",
  "live",
  "maintenance",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { phase } = body as { phase: ProjectPhase };

  if (!phase || !VALID_PHASES.includes(phase)) {
    return NextResponse.json(
      { error: `Invalid phase. Must be one of: ${VALID_PHASES.join(", ")}` },
      { status: 400 }
    );
  }

  // When a project goes live, change status from active to launched
  // When toggling back from maintenance to live, keep launched status
  const updateData: Record<string, string> = {
    phase,
    phase_updated_at: new Date().toISOString(),
  };

  if (phase === "live") {
    // Check current status -- only flip to launched if currently active
    const { data: current } = await supabase
      .from("projects")
      .select("status")
      .eq("id", id)
      .single();

    if (current?.status === "active") {
      updateData.status = "launched";
    }
  }

  const { data: project, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify the client about the phase change
  try {
    const { data: clientRecord } = await supabase
      .from("clients")
      .select("profile_id")
      .eq("id", project.client_id)
      .single();

    if (clientRecord?.profile_id) {
      const message =
        phase === "live"
          ? "Your project is now live!"
          : phase === "maintenance"
            ? "Your project is in maintenance mode. We're working on your requested changes."
            : `Your project has moved to the ${phase} phase.`;

      await createNotification({
        userId: clientRecord.profile_id,
        type: "phase_updated",
        title:
          phase === "live"
            ? "Project is live!"
            : phase === "maintenance"
              ? "Maintenance in progress"
              : "Project phase updated",
        message,
        link: "/dashboard/projects",
      });
    }
  } catch (e) {
    console.error("Notification failed:", e);
  }

  return NextResponse.json({ project });
}
