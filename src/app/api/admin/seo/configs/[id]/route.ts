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

  const { tier, keywords, competitors, ...rest } = body as {
    tier?: SeoTier;
    keywords?: string[];
    competitors?: Array<{ name: string; url: string }>;
    [key: string]: unknown;
  };

  if (tier !== undefined) {
    if (!VALID_TIERS.includes(tier)) {
      return NextResponse.json(
        { error: `Invalid tier "${tier}"` },
        { status: 400 }
      );
    }

    const tierDefaults = SEO_TIER_DEFAULTS[tier];

    if (keywords !== undefined) {
      if (
        Array.isArray(keywords) &&
        keywords.length > tierDefaults.maxKeywords
      ) {
        return NextResponse.json(
          {
            error: `keywords exceeds limit of ${tierDefaults.maxKeywords} for tier "${tier}"`,
          },
          { status: 400 }
        );
      }
    } else {
      const { data: existing, error: fetchError } = await supabase!
        .from("seo_configs")
        .select("keywords, competitors")
        .eq("id", id)
        .single();

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      if (
        Array.isArray(existing?.keywords) &&
        existing.keywords.length > tierDefaults.maxKeywords
      ) {
        return NextResponse.json(
          {
            error: `Existing keywords count exceeds limit of ${tierDefaults.maxKeywords} for tier "${tier}"`,
          },
          { status: 400 }
        );
      }

      const effectiveCompetitors =
        competitors !== undefined ? competitors : existing?.competitors ?? [];
      if (
        Array.isArray(effectiveCompetitors) &&
        effectiveCompetitors.length > tierDefaults.maxCompetitors
      ) {
        return NextResponse.json(
          {
            error: `competitors exceeds limit of ${tierDefaults.maxCompetitors} for tier "${tier}"`,
          },
          { status: 400 }
        );
      }
    }

    if (
      competitors !== undefined &&
      Array.isArray(competitors) &&
      competitors.length > tierDefaults.maxCompetitors
    ) {
      return NextResponse.json(
        {
          error: `competitors exceeds limit of ${tierDefaults.maxCompetitors} for tier "${tier}"`,
        },
        { status: 400 }
      );
    }
  } else {
    if (keywords !== undefined || competitors !== undefined) {
      const { data: existing, error: fetchError } = await supabase!
        .from("seo_configs")
        .select("tier, keywords, competitors")
        .eq("id", id)
        .single();

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      const effectiveTier: SeoTier = (existing?.tier as SeoTier) ?? "essentials";
      const tierDefaults = SEO_TIER_DEFAULTS[effectiveTier];

      if (
        keywords !== undefined &&
        Array.isArray(keywords) &&
        keywords.length > tierDefaults.maxKeywords
      ) {
        return NextResponse.json(
          {
            error: `keywords exceeds limit of ${tierDefaults.maxKeywords} for tier "${effectiveTier}"`,
          },
          { status: 400 }
        );
      }
      if (
        competitors !== undefined &&
        Array.isArray(competitors) &&
        competitors.length > tierDefaults.maxCompetitors
      ) {
        return NextResponse.json(
          {
            error: `competitors exceeds limit of ${tierDefaults.maxCompetitors} for tier "${effectiveTier}"`,
          },
          { status: 400 }
        );
      }
    }
  }

  const updatePayload: Record<string, unknown> = {
    ...rest,
    ...(tier !== undefined ? { tier } : {}),
    ...(keywords !== undefined ? { keywords } : {}),
    ...(competitors !== undefined ? { competitors } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error: dbError } = await supabase!
    .from("seo_configs")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ config: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  const { error: dbError } = await supabase!
    .from("seo_configs")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
