import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TIER_DEFAULTS } from "@/lib/chatbot/tier-defaults";
import type { ChatbotTier } from "@/lib/supabase/chatbot-types";

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

export async function GET() {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { data, error: dbError } = await supabase!
    .from("chatbot_configs")
    .select("*, clients(company_name)")
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data);
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

  const { slug, system_prompt, tier, logo_url, ...rest } = body as {
    slug?: string;
    system_prompt?: string;
    tier?: ChatbotTier;
    logo_url?: string;
    [key: string]: unknown;
  };

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  if (!system_prompt || typeof system_prompt !== "string") {
    return NextResponse.json(
      { error: "system_prompt is required" },
      { status: 400 }
    );
  }

  if (logo_url) {
    if (!isLogoUrlAllowed(logo_url)) {
      return NextResponse.json(
        { error: "logoUrl host not allowed" },
        { status: 400 }
      );
    }
  }

  const tierDefaults =
    tier && TIER_DEFAULTS[tier] ? TIER_DEFAULTS[tier] : TIER_DEFAULTS["essentials"];
  const resolvedTier: ChatbotTier = tier && TIER_DEFAULTS[tier] ? tier : "essentials";

  const insertPayload = {
    slug,
    system_prompt,
    tier: resolvedTier,
    ...(logo_url ? { logo_url } : {}),
    model: tierDefaults.model,
    lead_capture_mode: tierDefaults.leadCaptureMode,
    page_limit: tierDefaults.pageLimit,
    knowledge_source_type: tierDefaults.knowledgeSourceType,
    monthly_conversation_cap: tierDefaults.monthlyConversationCap,
    custom_fields: tierDefaults.customFields,
    remove_branding: tierDefaults.removeBranding,
    direct_api_access: tierDefaults.directApiAccess,
    webhooks: tierDefaults.webhooks,
    ...rest,
  };

  const { data, error: dbError } = await supabase!
    .from("chatbot_configs")
    .insert(insertPayload)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
