// src/lib/supabase/types.ts
// TypeScript types matching the Supabase schema

export type UserRole = "admin" | "client";

export type ServiceType =
  | "web_starter"
  | "web_professional"
  | "web_ecommerce"
  | "seo_cleanup"
  | "seo_growth"
  | "maintenance";

export type ServiceStatus = "active" | "completed" | "cancelled";
export type ProjectStatus = "active" | "on_hold" | "cancelled" | "completed";
export type ProjectPhase = "discovery" | "design" | "development" | "review" | "live";
export type ProposalStatus = "draft" | "sent" | "approved" | "declined";
export type PaymentMilestone = "deposit" | "midpoint" | "final" | "monthly";
export type PaymentStatus = "pending" | "paid" | "overdue";
export type RequestStatus = "pending" | "in_progress" | "completed";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  company: string | null;
  website_url: string | null;
}

export interface Client {
  id: string;
  profile_id: string;
  company_name: string;
  contact_email: string;
  website_url: string | null;
  ga4_property_id: string | null;
  search_console_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientService {
  id: string;
  client_id: string;
  service_type: ServiceType;
  status: ServiceStatus;
  monthly_amount: number | null;
  stripe_subscription_id: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface Project {
  id: string;
  client_id: string;
  client_service_id: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  phase_updated_at: string;
  estimated_completion: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  phase: ProjectPhase;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Proposal {
  id: string;
  client_id: string;
  project_id: string | null;
  content: Record<string, unknown>;
  payment_schedule: Array<{
    milestone: PaymentMilestone;
    amount: number;
    percentage: number;
  }>;
  status: ProposalStatus;
  sent_at: string | null;
  approved_at: string | null;
  approved_by_ip: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  client_id: string;
  client_service_id: string;
  project_id: string | null;
  stripe_payment_intent_id: string | null;
  amount: number;
  milestone_label: PaymentMilestone;
  status: PaymentStatus;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface ContentRequest {
  id: string;
  client_id: string;
  subject: string;
  description: string;
  attachments: string[];
  status: RequestStatus;
  created_at: string;
  completed_at: string | null;
}

export interface ClientAnalytics {
  id: string;
  client_id: string;
  date: string;
  page_views: number;
  unique_visitors: number;
  bounce_rate: number | null;
  avg_session_duration: number | null;
  top_pages: Array<{ path: string; views: number }>;
  referral_sources: Array<{ source: string; sessions: number }>;
}

export interface ClientSeoMetrics {
  id: string;
  client_id: string;
  date: string;
  impressions: number;
  clicks: number;
  avg_position: number | null;
  ctr: number | null;
  top_queries: Array<{ query: string; impressions: number; clicks: number; position: number }>;
  indexed_pages: number | null;
}

export interface Report {
  id: string;
  client_id: string;
  title: string;
  file_url: string;
  period_start: string;
  period_end: string;
  created_at: string;
}
