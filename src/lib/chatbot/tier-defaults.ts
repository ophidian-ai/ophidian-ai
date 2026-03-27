import type { ChatbotTier, LeadCaptureMode } from "@/lib/supabase/chatbot-types";

export interface TierConfig {
  model: string;
  leadCaptureMode: LeadCaptureMode;
  pageLimit: number | null;
  knowledgeSourceType: "namespace" | "index";
  monthlyConversationCap: number | null;
  customFields: boolean;
  removeBranding: boolean;
  directApiAccess: boolean;
  webhooks: boolean;
}

export const TIER_DEFAULTS: Record<ChatbotTier, TierConfig> = {
  // NOTE: All tiers use Gemini until AI Gateway / Anthropic keys are provisioned.
  // When ready, update growth → anthropic/claude-haiku-4.5, pro → anthropic/claude-sonnet-4.5
  essentials: {
    model: "google/gemini-2.5-flash",
    leadCaptureMode: "message_count",
    pageLimit: 50,
    knowledgeSourceType: "namespace",
    monthlyConversationCap: 500,
    customFields: false,
    removeBranding: false,
    directApiAccess: false,
    webhooks: false,
  },
  growth: {
    model: "google/gemini-2.5-flash",
    leadCaptureMode: "intent",
    pageLimit: 200,
    knowledgeSourceType: "namespace",
    monthlyConversationCap: 2000,
    customFields: true,
    removeBranding: false,
    directApiAccess: true,
    webhooks: false,
  },
  pro: {
    model: "google/gemini-2.5-flash",
    leadCaptureMode: "intent",
    pageLimit: null,
    knowledgeSourceType: "index",
    monthlyConversationCap: null,
    customFields: true,
    removeBranding: true,
    directApiAccess: true,
    webhooks: true,
  },
};

export const SESSION_RATE_LIMIT = {
  maxMessages: 30,
  windowSeconds: 300,
};

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_CONVERSATION_MESSAGES = 50;
export const RAG_TOP_K = 5;
export const MODEL_TEMPERATURE = 0.3;
