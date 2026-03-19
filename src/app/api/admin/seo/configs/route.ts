import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SEO_TIER_DEFAULTS } from "@/lib/seo/tier-defaults";
import type { SeoTier } from "@/lib/supabase/seo-types";

const VALID_TIERS: SeoTier[] = ["essentials", "growth", "pro"];

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

export async function GET() {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { data, error: dbError } = await supabase!
    .from("seo_configs")
    .select("*, clients(company_name)")
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ configs: data });
}

export async function POST(request: NextRequest) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    url,
    delivery_email,
    tier,
    target_keywords,
    competitors,
    ...rest
  } = body as {
    url?: string;
    delivery_email?: string;
    tier?: SeoTier;
    target_keywords?: string[];
    competitors?: Array<{ name: string; url: string }>;
    [key: string]: unknown;
  };

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }
  if (!delivery_email || typeof delivery_email !== "string") {
    return NextResponse.json(
      { error: "delivery_email is required" },
      { status: 400 }
    );
  }

  const resolvedTier: SeoTier =
    tier && VALID_TIERS.includes(tier) ? tier : "essentials";
  const tierDefaults = SEO_TIER_DEFAULTS[resolvedTier];

  const resolvedKeywords = Array.isArray(target_keywords)
    ? target_keywords
    : [];
  const resolvedCompetitors = Array.isArray(competitors) ? competitors : [];

  if (resolvedKeywords.length > tierDefaults.maxKeywords) {
    return NextResponse.json(
      {
        error: `target_keywords exceeds limit of ${tierDefaults.maxKeywords} for tier "${resolvedTier}"`,
      },
      { status: 400 }
    );
  }
  if (resolvedCompetitors.length > tierDefaults.maxCompetitors) {
    return NextResponse.json(
      {
        error: `competitors exceeds limit of ${tierDefaults.maxCompetitors} for tier "${resolvedTier}"`,
      },
      { status: 400 }
    );
  }

  const insertPayload = {
    url,
    delivery_email,
    tier: resolvedTier,
    target_keywords: resolvedKeywords,
    competitors: resolvedCompetitors,
    ...rest,
  };

  const { data, error: dbError } = await supabase!
    .from("seo_configs")
    .insert(insertPayload)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ config: data }, { status: 201 });
}
