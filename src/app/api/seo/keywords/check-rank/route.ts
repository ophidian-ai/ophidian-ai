import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkKeywordRanks } from "@/lib/seo/rank-tracker";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { keyword?: unknown; url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { keyword, url } = body;

  if (!keyword || typeof keyword !== "string") {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const results = await checkKeywordRanks(url, [keyword], []);
  const result = results[0];

  return NextResponse.json({
    position: result?.position ?? "not-found",
    aiOverview: result?.aiOverview ?? false,
  });
}
