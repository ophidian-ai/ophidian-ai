import type { ChatbotTier } from "@/lib/supabase/chatbot-types";

export interface CrmTierConfig {
  maxContacts: number | null;
  maxDeals: number | null;
  maxPipelines: number | null;
  maxCustomFields: number | null;
  automationEnabled: boolean;
  apiAccess: "none" | "read" | "full";
}

export const CRM_TIER_DEFAULTS: Record<ChatbotTier, CrmTierConfig> = {
  essentials: {
    maxContacts: 250,
    maxDeals: 100,
    maxPipelines: 1,
    maxCustomFields: 0,
    automationEnabled: false,
    apiAccess: "none",
  },
  growth: {
    maxContacts: 1000,
    maxDeals: 500,
    maxPipelines: 3,
    maxCustomFields: 5,
    automationEnabled: false,
    apiAccess: "read",
  },
  pro: {
    maxContacts: null,
    maxDeals: null,
    maxPipelines: null,
    maxCustomFields: null,
    automationEnabled: true,
    apiAccess: "full",
  },
};

export interface PipelineStageDefault {
  name: string;
  probability: number;
  color: string;
}

export const DEFAULT_PIPELINE_STAGES: PipelineStageDefault[] = [
  { name: "Lead",        probability: 10,  color: "blue"   },
  { name: "Contacted",   probability: 20,  color: "cyan"   },
  { name: "Qualified",   probability: 40,  color: "yellow" },
  { name: "Proposal",    probability: 60,  color: "orange" },
  { name: "Negotiation", probability: 80,  color: "purple" },
  { name: "Won",         probability: 100, color: "green"  },
  { name: "Lost",        probability: 0,   color: "red"    },
];
