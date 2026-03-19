import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("authorization") !==
    "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Archive pending tasks with due_at more than 30 days in the past
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: tasks, error: fetchError } = await supabase
    .from("crm_tasks")
    .select("id")
    .eq("status", "pending")
    .lt("due_at", cutoff);

  if (fetchError) {
    console.error("[cron/crm-task-archive] Fetch error:", fetchError.message);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!tasks || tasks.length === 0) {
    return NextResponse.json({ archived: 0 });
  }

  const ids = tasks.map((t) => t.id);

  const { error: updateError } = await supabase
    .from("crm_tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in("id", ids);

  if (updateError) {
    console.error("[cron/crm-task-archive] Update error:", updateError.message);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  console.log(`[cron/crm-task-archive] Archived ${ids.length} overdue tasks`);
  return NextResponse.json({ archived: ids.length });
}
