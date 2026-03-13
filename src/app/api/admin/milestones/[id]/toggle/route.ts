import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  _request: NextRequest,
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

  // Fetch current milestone
  const { data: milestone, error: fetchError } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  // Toggle completed_at
  const newCompletedAt = milestone.completed_at
    ? null
    : new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from("project_milestones")
    .update({ completed_at: newCompletedAt })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Notify client when a milestone is completed
  if (newCompletedAt) {
    try {
      const { data: project } = await supabase
        .from("projects")
        .select("client_id")
        .eq("id", milestone.project_id)
        .single();

      if (project) {
        const { data: clientRecord } = await supabase
          .from("clients")
          .select("profile_id")
          .eq("id", project.client_id)
          .single();

        if (clientRecord?.profile_id) {
          await createNotification({
            userId: clientRecord.profile_id,
            type: "milestone_completed",
            title: "Milestone completed",
            message: `"${milestone.title}" has been marked as complete.`,
            link: "/dashboard/projects",
          });
        }
      }
    } catch (e) {
      console.error("Notification failed:", e);
    }
  }

  return NextResponse.json({ milestone: updated });
}
