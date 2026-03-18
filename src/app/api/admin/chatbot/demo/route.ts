import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { provisionDemo } from "@/lib/chatbot/demo";

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

export async function POST(request: NextRequest) {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { businessName, slug, websiteUrl, scrapedContent, primaryColor, systemPrompt } = body as {
    businessName?: string;
    slug?: string;
    websiteUrl?: string;
    scrapedContent?: Array<{ text: string; source: string }>;
    primaryColor?: string;
    systemPrompt?: string;
  };

  if (!businessName || typeof businessName !== "string") {
    return NextResponse.json({ error: "businessName is required" }, { status: 400 });
  }
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  if (!websiteUrl || typeof websiteUrl !== "string") {
    return NextResponse.json({ error: "websiteUrl is required" }, { status: 400 });
  }

  try {
    const result = await provisionDemo({
      businessName,
      slug,
      websiteUrl,
      scrapedContent: scrapedContent ?? [],
      primaryColor,
      systemPrompt,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
