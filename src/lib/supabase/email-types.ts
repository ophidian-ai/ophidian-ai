export type EmailCampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled";
export type EmailEnrollmentStatus = "active" | "completed" | "paused" | "unsubscribed";
export type EmailRecipientStatus = "pending" | "sent" | "delivered" | "opened" | "clicked" | "bounced" | "complained";

export interface EmailConfig {
  id: string;
  client_id: string;
  tier: "essentials" | "growth" | "pro";
  sending_domain: string;
  sending_domain_verified: boolean;
  from_name: string;
  from_email: string;
  brand_config: { logoUrl?: string; primaryColor?: string; footerText?: string; socialLinks?: Record<string, string>; address?: string };
  monthly_send_limit: number;
  sends_this_month: number;
  max_contacts: number;
  campaigns_this_month: number;
  max_active_sequences: number;
  api_key_hash: string | null;
  unsubscribe_secret: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailContact {
  id: string;
  client_id: string;
  email: string;
  name: string | null;
  phone: string | null;
  tags: string[];
  source: string;
  engagement_score: number;
  last_engaged_at: string | null;
  subscribed: boolean;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  config_id: string | null;
  name: string;
  category: string;
  subject_template: string;
  html_template: string;
  is_base: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  config_id: string;
  template_id: string;
  name: string;
  subject: string;
  subject_variants: string[] | null;
  winning_variant: number | null;
  ab_metric: string;
  content: string;
  segment_filter: { tags?: string[]; engagement_min?: number; last_engaged_after?: string } | null;
  scheduled_at: string | null;
  sent_at: string | null;
  status: EmailCampaignStatus;
  stats: { total?: number; sent?: number; delivered?: number; opened?: number; clicked?: number; bounced?: number; complained?: number; per_variant?: Array<{ variant: number; sent: number; opened: number; clicked: number }> };
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignRecipient {
  id: string;
  campaign_id: string;
  contact_id: string;
  resend_message_id: string | null;
  variant_index: number | null;
  status: EmailRecipientStatus;
  link_clicks: Record<string, number> | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
}

export interface EmailSequence {
  id: string;
  config_id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  steps: Array<{ order: number; template_id: string; delay_hours: number; condition: { type: string; step: number } | null }>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailSequenceEnrollment {
  id: string;
  sequence_id: string;
  contact_id: string;
  current_step: number;
  status: EmailEnrollmentStatus;
  next_send_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailEvent {
  id: string;
  resend_message_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}
