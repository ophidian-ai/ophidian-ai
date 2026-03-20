export interface AdConfig {
  id: string;
  client_id: string;
  tier: "essentials" | "growth" | "pro";
  google_ads_customer_id: string | null;
  google_ads_connected: boolean;
  meta_ad_account_id: string | null;
  meta_connected: boolean;
  monthly_management_fee: number;
  monthly_ad_budget: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdCampaign {
  id: string;
  config_id: string;
  platform: string;
  platform_campaign_id: string;
  name: string;
  status: string;
  objective: string | null;
  daily_budget: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdMetrics {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  cost_per_click: number;
  cost_per_conversion: number;
  click_through_rate: number;
  conversion_rate: number;
  created_at: string;
}

export interface AdCopyDraft {
  id: string;
  config_id: string;
  platform: string;
  ad_type: string;
  headlines: string[];
  descriptions: string[];
  call_to_action: string | null;
  target_audience: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
