import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { invalidateConfigCache } from "@/lib/chatbot/config";

const ALLOWED_LOGO_HOSTS = [
  "ophidianai.com",
  "www.ophidianai.com",
];
const ALLOWED_LOGO_HOST_PATTERNS = [/^[^.]+\.vercel-storage\.com$/];

function isLogoUrlAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    if (ALLOWED_LOGO_HOSTS.includes(host)) return true;
    if (ALLOWED_LOGO_HOST_PATTERNS.some((p) => p.test(host))) return true;
    return false;
  } catch {
    return false;
  }
}

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
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { logo_url, ...rest } = body as {
    logo_url?: string;
    [key: string]: unknown;
  };

  if (logo_url) {
    if (!isLogoUrlAllowed(logo_url)) {
      return NextResponse.json(
        { error: "logoUrl host not allowed" },
        { status: 400 }
      );
    }
  }

  const updatePayload = {
    ...(logo_url !== undefined ? { logo_url } : {}),
    ...rest,
    updated_at: new Date().toISOString(),
  };

  const { data, error: dbError } = await supabase!
    .from("chatbot_configs")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await invalidateConfigCache(data.slug);

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  const { data, error: dbError } = await supabase!
    .from("chatbot_configs")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("slug")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await invalidateConfigCache(data.slug);

  return NextResponse.json({ success: true });
}
