import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

  const isAdmin = profile?.role === "admin";

  let query = supabase
    .from("content_batches")
    .select("*")
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    query = query.eq("client_id", client.id);
  }

  const { data: batches, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(batches);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins can create batches
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { client_id, batch_label, period_start, period_end, posts } = body;

  if (!batch_label || !period_start || !period_end) {
    return NextResponse.json(
      { error: "batch_label, period_start, and period_end are required" },
      { status: 400 }
    );
  }

  // Create batch
  const { data: batch, error: batchError } = await supabase
    .from("content_batches")
    .insert({
      client_id: client_id || null,
      batch_label,
      status: "draft",
      period_start,
      period_end,
      post_count: posts?.length || 0,
    })
    .select()
    .single();

  if (batchError) {
    return NextResponse.json({ error: batchError.message }, { status: 500 });
  }

  // Create posts if provided
  if (posts && Array.isArray(posts) && posts.length > 0) {
    const postRows = posts.map(
      (
        post: {
          pillar: string;
          hook: string;
          body: string;
          cta: string;
          hashtags: string[];
          platforms: string[];
          image_source: string;
          image_prompt: string | null;
          scheduled_date: string | null;
        },
        idx: number
      ) => ({
        batch_id: batch.id,
        post_number: idx + 1,
        pillar: post.pillar,
        hook: post.hook,
        body: post.body,
        cta: post.cta,
        hashtags: post.hashtags || [],
        platforms: post.platforms || ["facebook", "instagram", "linkedin", "tiktok"],
        image_source: post.image_source,
        image_prompt: post.image_prompt || null,
        image_urls: null,
        scheduled_date: post.scheduled_date || null,
        published_urls: null,
      })
    );

    const { error: postsError } = await supabase
      .from("content_posts")
      .insert(postRows);

    if (postsError) {
      return NextResponse.json({ error: postsError.message }, { status: 500 });
    }
  }

  return NextResponse.json(batch, { status: 201 });
}
