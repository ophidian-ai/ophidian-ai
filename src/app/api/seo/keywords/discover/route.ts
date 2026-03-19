import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { discoverKeywords } from "@/lib/seo/keyword-engine";
import { KEYWORD_DISCOVERY_MAX_QUERIES } from "@/lib/seo/tier-defaults";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { topic?: unknown; location?: unknown; limit?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topic, location, limit: rawLimit } = body;

  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }
  if (!location || typeof location !== "string") {
    return NextResponse.json({ error: "location is required" }, { status: 400 });
  }

  const limit = typeof rawLimit === "number" ? rawLimit : KEYWORD_DISCOVERY_MAX_QUERIES;

  if (limit > KEYWORD_DISCOVERY_MAX_QUERIES) {
    return NextResponse.json(
      { error: `limit cannot exceed ${KEYWORD_DISCOVERY_MAX_QUERIES}` },
      { status: 400 }
    );
  }

  const suggestions = await discoverKeywords(topic, location, limit);

  return NextResponse.json({ suggestions });
}
