import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeTask } from "@/lib/crm/tasks";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { complete, title, description, due_at } = body as {
    complete?: boolean;
    title?: string;
    description?: string;
    due_at?: string;
  };

  if (complete === true) {
    try {
      await completeTask(id);
      return NextResponse.json({ completed: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete task";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  // Field updates
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (due_at !== undefined) updates.due_at = due_at;

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  const { data: updated, error: updateError } = await supabase!
    .from("crm_tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message ?? "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ task: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { error: dbError } = await supabase!
    .from("crm_tasks")
    .update({ status: "deleted", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
