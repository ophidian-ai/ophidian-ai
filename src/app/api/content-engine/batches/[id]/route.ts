import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: batch, error: batchError } = await supabase
    .from("content_batches")
    .select("*")
    .eq("id", id)
    .single();

  if (batchError || !batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const { data: posts, error: postsError } = await supabase
    .from("content_posts")
    .select("*")
    .eq("batch_id", id)
    .order("post_number", { ascending: true });

  if (postsError) {
    return NextResponse.json({ error: postsError.message }, { status: 500 });
  }

  return NextResponse.json({ ...batch, posts: posts || [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
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
  const { status } = body;

  const validStatuses = ["draft", "review", "approved", "scheduled", "published"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  const updates: Record<string, string | null> = { status };
  if (status === "approved") updates.approved_at = new Date().toISOString();
  if (status === "published") updates.published_at = new Date().toISOString();

  const { data: batch, error } = await supabase
    .from("content_batches")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(batch);
}
