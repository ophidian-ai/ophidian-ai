import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSiteAudit, storeAudit } from "@/lib/seo/audit-engine";
import { checkKeywordRanks, storeRankings } from "@/lib/seo/rank-tracker";
import { scanContentFreshness } from "@/lib/seo/content-freshness";
import { generateGbpDraft, storeGbpDraft } from "@/lib/seo/gbp-generator";
import { generateSeoReport } from "@/lib/seo/report-generator";
import { SEO_TIER_DEFAULTS, AUDIT_RATE_LIMIT_PER_DAY } from "@/lib/seo/tier-defaults";
import { generateText } from "ai";
import { Resend } from "resend";
import type { SeoConfig, SeoAudit } from "@/lib/supabase/seo-types";

export const maxDuration = 300;

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
  // Auth: accept CRON_SECRET Bearer token OR admin session
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  let supabase;

  if (authHeader && cronSecret && authHeader === `Bearer ${cronSecret}`) {
    supabase = await createClient();
  } else {
    const result = await requireAdmin();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    supabase = result.supabase!;
  }

  const { id } = await params;

  try {
    // Load seo_config by id (active only)
    const { data: config, error: configError } = await supabase
      .from("seo_configs")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .single();

    if (configError || !config) {
      return NextResponse.json({ error: "SEO config not found" }, { status: 404 });
    }

    const seoConfig = config as SeoConfig;

    // Rate limit: check if audit already ran today
    const todayStr = new Date().toISOString().slice(0, 10);
    const { data: existingAudit } = await supabase
      .from("seo_audits")
      .select("id")
      .eq("config_id", id)
      .eq("date", todayStr)
      .maybeSingle();

    if (existingAudit) {
      return NextResponse.json(
        { error: "Audit already ran today. Next available tomorrow." },
        { status: 429 }
      );
    }

    // Run audit
    const audit = await runSiteAudit(seoConfig.url, seoConfig.tier);

    // Check keyword rankings
    const rankings = await checkKeywordRanks(
      seoConfig.url,
      seoConfig.target_keywords,
      seoConfig.competitors
    );

    // Store rankings
    await storeRankings(seoConfig.id, todayStr, rankings);

    // Get previous audit
    const { data: previousAuditRows } = await supabase
      .from("seo_audits")
      .select("*")
      .eq("config_id", id)
      .order("date", { ascending: false })
      .limit(1);

    const previousAudit: SeoAudit | null =
      previousAuditRows && previousAuditRows.length > 0 ? previousAuditRows[0] : null;

    const tierDefaults = SEO_TIER_DEFAULTS[seoConfig.tier];

    // Content freshness (Growth/Pro only)
    let freshnessResults = null;
    if (tierDefaults.contentFreshnessAlerts) {
      freshnessResults = await scanContentFreshness(seoConfig.url);
    }

    // GBP draft (Growth/Pro only)
    if (
      tierDefaults.gbpSync !== "manual" &&
      freshnessResults &&
      freshnessResults.length > 0
    ) {
      const blogPages = freshnessResults.filter(
        (p) => p.url?.includes("/blog") || p.url?.includes("/article") || p.url?.includes("/post")
      );
      const targetPages =
        blogPages.length > 0 ? blogPages : freshnessResults;
      const mostRecentPage = targetPages.sort(
        (a, b) =>
          new Date(b.publishDate ?? 0).getTime() -
          new Date(a.publishDate ?? 0).getTime()
      )[0];

      if (mostRecentPage) {
        const gbpDraft = await generateGbpDraft(mostRecentPage.url, seoConfig.target_keywords, seoConfig);
        await storeGbpDraft(seoConfig.id, mostRecentPage.url, gbpDraft.content, gbpDraft.keywordsUsed);
      }
    }

    // AI insights (Pro only)
    let aiInsights: string | null = null;
    if (tierDefaults.aiInsights) {
      const { text } = await generateText({
        model: "google/gemini-2.5-flash" as Parameters<typeof generateText>[0]["model"],
        prompt: `You are an SEO analyst. Write a concise narrative summary (3-5 paragraphs) for a client SEO report.

Audit scores: ${JSON.stringify(audit.scores ?? {})}
Rankings: ${JSON.stringify(rankings.map(r => ({ keyword: r.keyword, position: r.position, aiOverview: r.aiOverview })))}
Top issues: ${JSON.stringify(audit.issues?.slice(0, 10) ?? [])}
${previousAudit ? `Previous audit date: ${previousAudit.date}` : "No previous audit available."}

Focus on: what improved, what declined, top priorities for the client to act on.`,
      });
      aiInsights = text;
    }

    // Generate report
    const reportUrl = await generateSeoReport(
      seoConfig,
      audit,
      rankings,
      previousAudit,
      aiInsights
    );

    // Store audit
    await storeAudit(
      seoConfig.id,
      todayStr,
      audit,
      reportUrl,
      aiInsights
    );

    // Email report
    if (seoConfig.delivery_email) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const formattedDate = new Date(todayStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      await resend.emails.send({
        from: "OphidianAI SEO <seo@ophidianai.com>",
        to: seoConfig.delivery_email,
        subject: `Your Monthly SEO Report - ${formattedDate}`,
        html: `<p>Your SEO report for ${formattedDate} is ready.</p>
<p><a href="${reportUrl}">Download your SEO Report PDF</a></p>
<p>Log in to your dashboard to view full rankings, audit details, and recommendations.</p>
<p>Questions? Reply to this email and we'll be in touch.</p>
<p>— OphidianAI SEO Team</p>`,
      });
    }

    return NextResponse.json({
      success: true,
      date: todayStr,
      reportUrl,
    });
  } catch (err) {
    console.error("[SEO run] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
