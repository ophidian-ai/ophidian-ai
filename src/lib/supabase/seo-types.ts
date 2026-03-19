export type SeoTier = "essentials" | "growth" | "pro";
export type GbpDraftStatus = "draft" | "approved" | "expired";

export interface SeoConfig {
  id: string;
  client_id: string | null;
  url: string;
  industry: string | null;
  location: string | null;
  tier: SeoTier;
  target_keywords: string[];
  competitors: Array<{ name: string; url: string }>;
  gbp_url: string | null;
  delivery_email: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeoAudit {
  id: string;
  config_id: string;
  date: string;
  score_onpage: number;
  score_technical: number;
  score_content: number;
  score_local: number;
  score_speed: number;
  score_ai_visibility: number;
  issues: Array<{ area: string; finding: string; severity: "high" | "medium" | "low"; impact: string; status: "open" | "fixed" | "in-progress" }>;
  recommendations: Array<{ priority: number; action: string; impact: string }>;
  ai_insights: string | null;
  report_url: string | null;
  created_at: string;
}

export interface SeoRanking {
  id: string;
  config_id: string;
  date: string;
  keyword: string;
  position: "top-3" | "top-10" | "top-20" | "not-found";
  ai_overview: boolean;
  competitor_positions: Record<string, string> | null;
  created_at: string;
}

export interface SeoGbpDraft {
  id: string;
  config_id: string;
  source_url: string;
  content: string;
  keywords_used: string[];
  status: GbpDraftStatus;
  expires_at: string;
  created_at: string;
}
