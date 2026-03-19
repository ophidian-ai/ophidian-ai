import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTask } from "@/lib/crm/tasks";
import type { CrmTask } from "@/lib/supabase/crm-types";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Unauthorized", status: 401 };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return { supabase: null, error: "Forbidden", status: 403 };
  return { supabase, error: null, status: 200 };
}

export async function GET(request: NextRequest) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(request.url);
  const configId = searchParams.get("config_id");
  const taskStatus = searchParams.get("status");

  let query = supabase!
    .from("crm_tasks")
    .select("*")
    .order("due_at", { ascending: true });

  if (configId) query = query.eq("config_id", configId);
  if (taskStatus) query = query.eq("status", taskStatus);

  const { data, error: dbError } = await query;

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const now = new Date().toISOString();
  const tasks = ((data ?? []) as CrmTask[]).map((task) => ({
    ...task,
    overdue: task.status === "pending" && task.due_at < now,
  }));

  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { config_id, contact_id, deal_id, title, description, due_at } = body as {
    config_id?: string;
    contact_id?: string;
    deal_id?: string;
    title?: string;
    description?: string;
    due_at?: string;
  };

  if (!config_id || typeof config_id !== "string") {
    return NextResponse.json({ error: "config_id is required" }, { status: 400 });
  }
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!due_at || typeof due_at !== "string") {
    return NextResponse.json({ error: "due_at is required" }, { status: 400 });
  }

  try {
    const task = await createTask(config_id, {
      contactId: contact_id,
      dealId: deal_id,
      title,
      description,
      dueAt: due_at,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create task";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
