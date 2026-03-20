import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAdCopy, type CopyRequest } from "@/lib/ads/copy-generator";

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
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { config_id, platform, ad_type, business_name, industry, location, objective, target_audience } =
    body as {
      config_id?: string;
      platform?: "google" | "meta";
      ad_type?: string;
      business_name?: string;
      industry?: string;
      location?: string;
      objective?: string;
      target_audience?: string;
    };

  if (!config_id || !platform || !ad_type || !business_name || !industry || !location || !objective) {
    return NextResponse.json(
      { error: "config_id, platform, ad_type, business_name, industry, location, and objective are required" },
      { status: 400 }
    );
  }

  const copyRequest: CopyRequest = {
    platform,
    adType: ad_type,
    businessName: business_name,
    industry,
    location,
    objective,
    targetAudience: target_audience,
  };

  let result;
  try {
    result = await generateAdCopy(copyRequest);
  } catch (genError) {
    return NextResponse.json(
      { error: genError instanceof Error ? genError.message : "Generation failed" },
      { status: 500 }
    );
  }

  const { data: draft, error: dbError } = await supabase!
    .from("ad_copy_drafts")
    .insert({
      config_id,
      platform,
      ad_type,
      headlines: result.headlines,
      descriptions: result.descriptions,
      call_to_action: result.callToAction,
      target_audience: result.targetAudience,
      status: "draft",
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(draft, { status: 201 });
}
