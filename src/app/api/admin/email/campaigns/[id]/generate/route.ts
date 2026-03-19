import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import type { EmailConfig } from "@/lib/supabase/email-types";

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  // Load campaign + config to check tier
  const { data: campaign, error: fetchError } = await supabase!
    .from("email_campaigns")
    .select("*, email_configs(tier)")
    .eq("id", id)
    .single();

  if (fetchError || !campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const emailConfig = campaign.email_configs as Pick<EmailConfig, "tier"> | null;
  const tier = emailConfig?.tier;

  // AI generation is Growth/Pro only
  if (tier !== "growth" && tier !== "pro") {
    return NextResponse.json(
      { error: "AI generation requires the Growth or Pro plan" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { prompt } = body as { prompt?: string };
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      model: "anthropic/claude-haiku-4.5" as any,
      system: `You are an email marketing copywriter. Generate an email subject line and HTML body based on the user's prompt.
Respond with valid JSON in this exact shape:
{"subject":"...","content":"<html email body>"}
Keep subject lines under 60 characters. The HTML should be clean, minimal, and mobile-friendly. Do not include markdown fences.`,
      prompt,
    });

    let parsed: { subject: string; content: string };
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: text },
        { status: 500 }
      );
    }

    if (!parsed.subject || !parsed.content) {
      return NextResponse.json(
        { error: "AI response missing subject or content", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subject: parsed.subject,
      content: parsed.content,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
