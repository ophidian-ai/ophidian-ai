import type { EmailConfig } from "@/lib/supabase/email-types";

type Tier = EmailConfig["tier"];

interface EmailTierDefaults {
  monthlySendLimit: number;
  maxContacts: number;
  maxCampaignsPerMonth: number;
  maxActiveSequences: number;
  maxCustomTemplates: number;
  contactLevelTracking: boolean;
  linkLevelTracking: boolean;
  aiGeneration: boolean;
  abTesting: boolean;
  segmentation: boolean;
  conditionalBranching: boolean;
  timeTriggers: boolean;
  apiTriggers: boolean;
  contactApi: boolean;
}

export const EMAIL_TIER_DEFAULTS: Record<Tier, EmailTierDefaults> = {
  essentials: {
    monthlySendLimit: 1000,
    maxContacts: 500,
    maxCampaignsPerMonth: 2,
    maxActiveSequences: 2,
    maxCustomTemplates: 0,
    contactLevelTracking: false,
    linkLevelTracking: false,
    aiGeneration: false,
    abTesting: false,
    segmentation: false,
    conditionalBranching: false,
    timeTriggers: false,
    apiTriggers: false,
    contactApi: false,
  },
  growth: {
    monthlySendLimit: 5000,
    maxContacts: 2500,
    maxCampaignsPerMonth: 8,
    maxActiveSequences: 5,
    maxCustomTemplates: 1,
    contactLevelTracking: true,
    linkLevelTracking: false,
    aiGeneration: true,
    abTesting: false,
    segmentation: true,
    conditionalBranching: true,
    timeTriggers: true,
    apiTriggers: false,
    contactApi: true,
  },
  pro: {
    monthlySendLimit: 25000,
    maxContacts: Infinity,
    maxCampaignsPerMonth: Infinity,
    maxActiveSequences: Infinity,
    maxCustomTemplates: 3,
    contactLevelTracking: true,
    linkLevelTracking: true,
    aiGeneration: true,
    abTesting: true,
    segmentation: true,
    conditionalBranching: true,
    timeTriggers: true,
    apiTriggers: true,
    contactApi: true,
  },
};

export const SEND_RATE_PER_SECOND = 10;
export const SEQUENCE_CRON_INTERVAL_MINUTES = 15;
export const AB_TEST_SAMPLE_PERCENT = 0.2;
export const AB_TEST_WAIT_HOURS = 2;
