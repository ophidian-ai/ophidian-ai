export type ChatbotTier = "essentials" | "growth" | "pro";
export type LeadCaptureMode = "message_count" | "intent";

export interface ChatbotConfig {
  id: string;
  client_id: string | null;
  slug: string;
  tier: ChatbotTier;
  model: string;
  system_prompt: string;
  greeting: string;
  knowledge_source: { type: "namespace" | "index"; name: string };
  theme: { primaryColor: string; position: "bottom-right" | "bottom-left"; logoUrl: string | null };
  allowed_origins: string[];
  conversation_count_month: number;
  lead_capture: { enabled: boolean; mode: LeadCaptureMode; trigger_after: number; fields: string[] };
  fallback_contact: { phone: string | null; email: string | null; address: string | null };
  page_limit: number | null;
  api_key_hash: string | null;
  is_demo: boolean;
  demo_expires_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatbotConversation {
  id: string;
  config_id: string;
  session_id: string;
  message_count: number;
  page_url: string | null;
  visitor_token: string | null;
  lead_captured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatbotMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ChatbotLead {
  id: string;
  config_id: string;
  conversation_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  custom_fields: Record<string, unknown> | null;
  source_page: string | null;
  created_at: string;
}

export interface ChatbotAnalytics {
  id: string;
  config_id: string;
  date: string;
  conversations_count: number;
  messages_count: number;
  leads_captured: number;
  avg_messages_per_conversation: number;
  top_questions: Record<string, number> | null;
  created_at: string;
}

export interface ChatbotWebhookFailure {
  id: string;
  config_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  attempts: number;
  last_error: string | null;
  created_at: string;
}
