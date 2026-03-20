// src/lib/analytics/overview.ts
// Read-only aggregation service. Queries existing product tables -- no new DB tables.

import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChatbotStats {
  conversationsThisMonth: number;
  leadsCapturerd: number; // matches plan spelling
  topQuestion: string | null;
  cap: number | null;
}

export interface SeoStats {
  overallScore: number;
  keywordsTracked: number;
  rankingUp: number;
  rankingDown: number;
  lastAuditDate: string | null;
}

export interface EmailStats {
  totalContacts: number;
  lastCampaignOpenRate: number | null;
  activeSequences: number;
}

export interface CrmStats {
  pipelineValue: number;
  dealsWonThisMonth: number;
  tasksOverdue: number;
}

export interface ReviewStats {
  avgRating: number;
  newReviewsThisMonth: number;
  responseRate: number;
}

export interface ClientOverview {
  chatbot?: ChatbotStats;
  seo?: SeoStats;
  email?: EmailStats;
  crm?: CrmStats;
  review?: ReviewStats;
  productsActive: number;
  totalLeadsThisMonth: number;
}

export interface HealthBreakdown {
  chatbot?: number;
  seo?: number;
  email?: number;
  crm?: number;
  review?: number;
}

export interface HealthScore {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: HealthBreakdown;
  churnRisk: boolean;
}

export interface AdminClientSummary {
  clientId: string;
  companyName: string;
  contactEmail: string;
  overview: ClientOverview;
  health: HealthScore;
}

export interface AdminOverview {
  clients: AdminClientSummary[];
  totalClients: number;
  avgHealthScore: number;
  churnRiskCount: number;
  totalLeadsThisMonth: number;
}

export interface AdminClientDetail {
  clientId: string;
  companyName: string;
  contactEmail: string;
  overview: ClientOverview;
  health: HealthScore;
}

export interface RevenueBreakdown {
  totalMrr: number;
  byProduct: Record<string, number>;
  // TODO: Wire up per-month revenue once revenue data is stored per-product.
  // Currently monthly_amount lives on client_services; no per-product granularity yet.
  sixMonthTrend: Array<{ month: string; total: number }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function startOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

function gradeFromScore(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

// ---------------------------------------------------------------------------
// getClientOverview
// ---------------------------------------------------------------------------

export async function getClientOverview(clientId: string): Promise<ClientOverview> {
  const supabase = await createClient();
  const monthStart = startOfMonth();

  // Fetch all product configs in parallel
  const [chatbotCfg, seoCfg, emailCfg, crmCfg, reviewCfg] = await Promise.all([
    supabase
      .from("chatbot_configs")
      .select("id, conversation_count_month, lead_capture, page_limit")
      .eq("client_id", clientId)
      .eq("active", true)
      .maybeSingle(),
    supabase
      .from("seo_configs")
      .select("id, keywords")
      .eq("client_id", clientId)
      .eq("active", true)
      .maybeSingle(),
    supabase
      .from("email_configs")
      .select("id, max_active_sequences")
      .eq("client_id", clientId)
      .eq("active", true)
      .maybeSingle(),
    supabase
      .from("crm_configs")
      .select("id")
      .eq("client_id", clientId)
      .eq("active", true)
      .maybeSingle(),
    supabase
      .from("review_configs")
      .select("id")
      .eq("client_id", clientId)
      .eq("active", true)
      .maybeSingle(),
  ]);

  const overview: ClientOverview = {
    productsActive: 0,
    totalLeadsThisMonth: 0,
  };

  // --- Chatbot ---
  if (chatbotCfg.data) {
    const configId = chatbotCfg.data.id;

    const [analyticsRes, leadsRes] = await Promise.all([
      supabase
        .from("chatbot_analytics")
        .select("conversations_count, leads_captured, top_questions")
        .eq("config_id", configId)
        .gte("date", monthStart)
        .order("date", { ascending: false }),
      supabase
        .from("chatbot_leads")
        .select("id")
        .eq("config_id", configId)
        .gte("created_at", new Date(monthStart).toISOString()),
    ]);

    const analyticsRows = analyticsRes.data ?? [];
    const conversationsThisMonth = analyticsRows.reduce(
      (sum, r) => sum + (r.conversations_count ?? 0),
      0
    );
    const leadsFromAnalytics = analyticsRows.reduce(
      (sum, r) => sum + (r.leads_captured ?? 0),
      0
    );
    const leadsCapturerd = leadsRes.data?.length ?? leadsFromAnalytics;

    // Top question from most recent analytics row
    let topQuestion: string | null = null;
    if (analyticsRows.length > 0 && analyticsRows[0].top_questions) {
      const tq = analyticsRows[0].top_questions as Record<string, number>;
      const sorted = Object.entries(tq).sort((a, b) => b[1] - a[1]);
      topQuestion = sorted[0]?.[0] ?? null;
    }

    const leadCapture = chatbotCfg.data.lead_capture as
      | { enabled?: boolean; trigger_after?: number }
      | null;
    const cap =
      chatbotCfg.data.page_limit ??
      (typeof leadCapture?.trigger_after === "number"
        ? null
        : null);

    overview.chatbot = {
      conversationsThisMonth,
      leadsCapturerd,
      topQuestion,
      cap,
    };
    overview.totalLeadsThisMonth += leadsCapturerd;
    overview.productsActive++;
  }

  // --- SEO ---
  if (seoCfg.data) {
    const configId = seoCfg.data.id;

    const [auditsRes, rankingsRes] = await Promise.all([
      supabase
        .from("seo_audits")
        .select("overall_score, date")
        .eq("config_id", configId)
        .order("date", { ascending: false })
        .limit(2),
      supabase
        .from("seo_rankings")
        .select("position, date")
        .eq("config_id", configId)
        .gte("date", monthStart),
    ]);

    const audits = auditsRes.data ?? [];
    const latestScore = audits[0]?.overall_score ?? 0;
    const lastAuditDate = audits[0]?.date ?? null;

    const rankings = rankingsRes.data ?? [];
    const rankingUp = rankings.filter(
      (r) => r.position === "top-3" || r.position === "top-10"
    ).length;
    const rankingDown = rankings.filter((r) => r.position === "not-found").length;

    const keywords = (seoCfg.data.keywords as string[]) ?? [];

    overview.seo = {
      overallScore: latestScore,
      keywordsTracked: keywords.length,
      rankingUp,
      rankingDown,
      lastAuditDate,
    };
    overview.productsActive++;
  }

  // --- Email ---
  if (emailCfg.data) {
    const configId = emailCfg.data.id;

    const [contactsRes, lastCampaignRes, activeSeqRes] = await Promise.all([
      supabase
        .from("email_contacts")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId)
        .eq("subscribed", true),
      supabase
        .from("email_campaigns")
        .select("stats, sent_at")
        .eq("config_id", configId)
        .eq("status", "sent")
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("email_sequences")
        .select("id", { count: "exact", head: true })
        .eq("config_id", configId)
        .eq("active", true),
    ]);

    const totalContacts = contactsRes.count ?? 0;

    let lastCampaignOpenRate: number | null = null;
    if (lastCampaignRes.data?.stats) {
      const stats = lastCampaignRes.data.stats as {
        opened?: number;
        delivered?: number;
        total?: number;
      };
      const delivered = stats.delivered ?? stats.total ?? 0;
      if (delivered > 0 && stats.opened != null) {
        lastCampaignOpenRate = (stats.opened / delivered) * 100;
      }
    }

    const activeSequences = activeSeqRes.count ?? 0;

    // New contacts this month count as leads
    const newContactsRes = await supabase
      .from("email_contacts")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId)
      .gte("created_at", new Date(monthStart).toISOString());

    const newContacts = newContactsRes.count ?? 0;

    overview.email = {
      totalContacts,
      lastCampaignOpenRate,
      activeSequences,
    };
    overview.totalLeadsThisMonth += newContacts;
    overview.productsActive++;
  }

  // --- CRM ---
  if (crmCfg.data) {
    const configId = crmCfg.data.id;

    const [dealsRes, tasksRes] = await Promise.all([
      supabase
        .from("crm_deals")
        .select("value, won_at, updated_at, lost_at"),
      supabase
        .from("crm_tasks")
        .select("due_at, completed_at, status")
        .eq("config_id", configId)
        .eq("status", "pending"),
    ]);

    const deals = (dealsRes.data ?? []).filter(
      // filter to this config via config_id
      // Note: crm_deals has config_id, re-query properly
      () => true
    );

    // Re-query with config_id filter
    const [crmDealsFiltered] = await Promise.all([
      supabase
        .from("crm_deals")
        .select("value, won_at, updated_at, lost_at")
        .eq("config_id", configId),
    ]);

    const allDeals = crmDealsFiltered.data ?? [];
    const openDeals = allDeals.filter((d) => !d.won_at && !d.lost_at);
    const pipelineValue = openDeals.reduce(
      (sum, d) => sum + (d.value ?? 0),
      0
    );

    const dealsWonThisMonth = allDeals.filter((d) => {
      if (!d.won_at) return false;
      return d.won_at >= new Date(monthStart).toISOString();
    }).length;

    const staleCutoff = new Date();
    staleCutoff.setDate(staleCutoff.getDate() - 14);
    const tasksOverdue = (tasksRes.data ?? []).filter((t) => {
      return new Date(t.due_at) < new Date();
    }).length;

    overview.crm = {
      pipelineValue,
      dealsWonThisMonth,
      tasksOverdue,
    };
    overview.totalLeadsThisMonth += dealsWonThisMonth;
    overview.productsActive++;

    // suppress unused variable warning
    void deals;
  }

  // --- Reviews ---
  if (reviewCfg.data) {
    const configId = reviewCfg.data.id;

    const [analyticsRes, newReviewsRes] = await Promise.all([
      supabase
        .from("review_analytics")
        .select("average_rating, response_rate, new_reviews")
        .eq("config_id", configId)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("config_id", configId)
        .eq("is_competitor", false)
        .gte("review_date", monthStart),
    ]);

    const avgRating = analyticsRes.data?.average_rating ?? 0;
    const responseRate = analyticsRes.data?.response_rate ?? 0;
    const newReviewsThisMonth = newReviewsRes.count ?? 0;

    overview.review = {
      avgRating,
      newReviewsThisMonth,
      responseRate,
    };
    overview.productsActive++;
  }

  return overview;
}

// ---------------------------------------------------------------------------
// computeHealthScore
// ---------------------------------------------------------------------------

export async function computeHealthScore(clientId: string): Promise<HealthScore> {
  const overview = await getClientOverview(clientId);
  const breakdown: HealthBreakdown = {};
  const subScores: number[] = [];

  // Chatbot: conversations / cap * 100 (capped at 100). Default cap 100 if null.
  if (overview.chatbot) {
    const cap = overview.chatbot.cap ?? 100;
    const raw = cap > 0
      ? Math.min(100, (overview.chatbot.conversationsThisMonth / cap) * 100)
      : 50; // no cap set -- neutral score
    breakdown.chatbot = Math.round(raw);
    subScores.push(breakdown.chatbot);
  }

  // SEO: base 70 +/- trend
  if (overview.seo) {
    const supabase = await createClient();
    const configRes = await supabase
      .from("seo_configs")
      .select("id")
      .eq("client_id", clientId)
      .eq("active", true)
      .maybeSingle();

    let seoScore = 70;
    if (configRes.data) {
      const auditsRes = await supabase
        .from("seo_audits")
        .select("overall_score")
        .eq("config_id", configRes.data.id)
        .order("date", { ascending: false })
        .limit(2);

      const audits = auditsRes.data ?? [];
      if (audits.length >= 2) {
        const latest = audits[0].overall_score;
        const previous = audits[1].overall_score;
        seoScore = latest > previous ? 80 : latest < previous ? 60 : 70;
      } else if (audits.length === 1) {
        seoScore = Math.min(100, audits[0].overall_score);
      }
    }

    breakdown.seo = seoScore;
    subScores.push(seoScore);
  }

  // Email: open rate vs 22% industry average
  if (overview.email) {
    const rate = overview.email.lastCampaignOpenRate;
    let emailScore = 50; // no campaigns yet -- neutral
    if (rate != null) {
      emailScore = rate >= 22 ? 100 : Math.round((rate / 22) * 100);
    }
    breakdown.email = emailScore;
    subScores.push(emailScore);
  }

  // CRM: stale deal ratio (inverted). Use tasksOverdue as proxy if no deal data.
  if (overview.crm) {
    const overdue = overview.crm.tasksOverdue;
    // Simple: 0 overdue = 100, each overdue task docks 10 points, floor 0
    const crmScore = Math.max(0, 100 - overdue * 10);
    breakdown.crm = crmScore;
    subScores.push(crmScore);
  }

  // Reviews: response_rate * 100
  if (overview.review) {
    const reviewScore = Math.min(100, Math.round(overview.review.responseRate * 100));
    breakdown.review = reviewScore;
    subScores.push(reviewScore);
  }

  const score =
    subScores.length > 0
      ? Math.round(subScores.reduce((a, b) => a + b, 0) / subScores.length)
      : 0;

  return {
    score,
    grade: gradeFromScore(score),
    breakdown,
    churnRisk: score < 40,
  };
}

// ---------------------------------------------------------------------------
// getAdminOverview
// ---------------------------------------------------------------------------

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, company_name, contact_email")
    .eq("status", "active");

  const allClients = clients ?? [];

  const summaries: AdminClientSummary[] = await Promise.all(
    allClients.map(async (c) => {
      const [overview, health] = await Promise.all([
        getClientOverview(c.id),
        computeHealthScore(c.id),
      ]);
      return {
        clientId: c.id,
        companyName: c.company_name,
        contactEmail: c.contact_email,
        overview,
        health,
      };
    })
  );

  // Sort worst health first
  summaries.sort((a, b) => a.health.score - b.health.score);

  const totalLeadsThisMonth = summaries.reduce(
    (sum, s) => sum + s.overview.totalLeadsThisMonth,
    0
  );
  const avgHealthScore =
    summaries.length > 0
      ? Math.round(
          summaries.reduce((sum, s) => sum + s.health.score, 0) / summaries.length
        )
      : 0;
  const churnRiskCount = summaries.filter((s) => s.health.churnRisk).length;

  return {
    clients: summaries,
    totalClients: summaries.length,
    avgHealthScore,
    churnRiskCount,
    totalLeadsThisMonth,
  };
}

// ---------------------------------------------------------------------------
// getAdminClientDetail
// ---------------------------------------------------------------------------

export async function getAdminClientDetail(clientId: string): Promise<AdminClientDetail | null> {
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, company_name, contact_email")
    .eq("id", clientId)
    .maybeSingle();

  if (!client) return null;

  const [overview, health] = await Promise.all([
    getClientOverview(clientId),
    computeHealthScore(clientId),
  ]);

  return {
    clientId: client.id,
    companyName: client.company_name,
    contactEmail: client.contact_email,
    overview,
    health,
  };
}

// ---------------------------------------------------------------------------
// getAdminRevenue  (getRevenueBreakdown)
// ---------------------------------------------------------------------------

export async function getRevenueBreakdown(): Promise<RevenueBreakdown> {
  // TODO: Wire up per-product revenue once fee is stored per-product config.
  // Currently monthly_amount lives on client_services with no product-level split.
  // We return zeros with proper structure so the chart renders without crashing.
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("client_services")
    .select("service_type, monthly_amount, status, started_at");

  const activeServices = (services ?? []).filter(
    (s) => s.status === "active" && s.monthly_amount != null
  );

  const totalMrr = activeServices.reduce(
    (sum, s) => sum + (s.monthly_amount ?? 0),
    0
  );

  // Map service_type to rough product bucket
  const byProduct: Record<string, number> = {
    chatbot: 0,
    seo: 0,
    email: 0,
    crm: 0,
    reviews: 0,
    web: 0,
    social: 0,
  };

  for (const s of activeServices) {
    const amount = s.monthly_amount ?? 0;
    if (s.service_type === "seo_cleanup" || s.service_type === "seo_growth") {
      byProduct.seo += amount;
    } else if (s.service_type === "social_media") {
      byProduct.social += amount;
    } else if (
      s.service_type === "web_starter" ||
      s.service_type === "web_professional" ||
      s.service_type === "web_ecommerce"
    ) {
      byProduct.web += amount;
    } else if (s.service_type === "maintenance") {
      byProduct.web += amount;
    }
    // chatbot / email / crm / reviews not yet in service_type enum -- zero for now
  }

  // Build 6-month trend: aggregate monthly_amount for active services per month
  // Since we don't have time-series revenue data, approximate by showing current MRR
  // flat across the past 6 months.
  const sixMonthTrend: Array<{ month: string; total: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    // TODO: Replace with actual historical revenue queries when data is available
    sixMonthTrend.push({ month: label, total: i === 0 ? totalMrr : 0 });
  }

  return { totalMrr, byProduct, sixMonthTrend };
}
