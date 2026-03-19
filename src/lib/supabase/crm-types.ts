import type { ChatbotTier } from "./chatbot-types";

export type CrmTaskStatus = "pending" | "completed";

export interface CrmConfig {
  id: string;
  client_id: string;
  tier: ChatbotTier;
  max_pipelines: number;
  max_custom_fields: number;
  custom_fields: unknown[];
  api_access: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmPipeline {
  id: string;
  config_id: string;
  name: string;
  stages: unknown[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmDeal {
  id: string;
  config_id: string;
  pipeline_id: string;
  contact_id: string;
  title: string;
  value: number | null;
  stage: string;
  probability: number;
  expected_close_at: string | null;
  won_at: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  custom_field_values: Record<string, unknown> | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface CrmActivity {
  id: string;
  config_id: string;
  contact_id: string;
  deal_id: string | null;
  type: string;
  description: string;
  linked_content_type: string | null;
  linked_content_id: string | null;
  auto_logged: boolean;
  linked_content_available: boolean;
  created_at: string;
}

export interface CrmTask {
  id: string;
  config_id: string;
  contact_id: string | null;
  deal_id: string | null;
  title: string;
  description: string | null;
  due_at: string;
  completed_at: string | null;
  /** "overdue" is computed at read time; only "pending" | "completed" are stored */
  status: CrmTaskStatus;
  auto_generated: boolean;
  automation_id: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmAutomation {
  id: string;
  config_id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
}
