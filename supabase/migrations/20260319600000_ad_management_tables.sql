-- Ad Management tables

CREATE TABLE ad_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tier chatbot_tier NOT NULL DEFAULT 'essentials',
  google_ads_customer_id text,
  google_ads_connected boolean NOT NULL DEFAULT false,
  meta_ad_account_id text,
  meta_connected boolean NOT NULL DEFAULT false,
  monthly_management_fee numeric NOT NULL DEFAULT 0,
  monthly_ad_budget numeric,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES ad_configs(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_campaign_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  objective text,
  daily_budget numeric,
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(config_id, platform, platform_campaign_id)
);

CREATE TABLE ad_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions int NOT NULL DEFAULT 0,
  clicks int NOT NULL DEFAULT 0,
  spend numeric NOT NULL DEFAULT 0,
  conversions int NOT NULL DEFAULT 0,
  cost_per_click numeric NOT NULL DEFAULT 0,
  cost_per_conversion numeric NOT NULL DEFAULT 0,
  click_through_rate real NOT NULL DEFAULT 0,
  conversion_rate real NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, date)
);

CREATE TABLE ad_copy_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid NOT NULL REFERENCES ad_configs(id) ON DELETE CASCADE,
  platform text NOT NULL,
  ad_type text NOT NULL,
  headlines text[] NOT NULL DEFAULT '{}',
  descriptions text[] NOT NULL DEFAULT '{}',
  call_to_action text,
  target_audience text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ad_configs_client ON ad_configs(client_id);
CREATE INDEX idx_ad_campaigns_config ON ad_campaigns(config_id);
CREATE INDEX idx_ad_metrics_campaign_date ON ad_metrics(campaign_id, date);
CREATE INDEX idx_ad_copy_drafts_config ON ad_copy_drafts(config_id);

-- RLS
ALTER TABLE ad_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_copy_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all_ad_configs ON ad_configs FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY admin_all_ad_campaigns ON ad_campaigns FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY admin_all_ad_metrics ON ad_metrics FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY admin_all_ad_copy_drafts ON ad_copy_drafts FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY client_read_ad_configs ON ad_configs FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid()));
CREATE POLICY client_read_ad_campaigns ON ad_campaigns FOR SELECT USING (config_id IN (SELECT id FROM ad_configs WHERE client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())));
CREATE POLICY client_read_ad_metrics ON ad_metrics FOR SELECT USING (campaign_id IN (SELECT id FROM ad_campaigns WHERE config_id IN (SELECT id FROM ad_configs WHERE client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid()))));
CREATE POLICY client_read_ad_copy_drafts ON ad_copy_drafts FOR SELECT USING (config_id IN (SELECT id FROM ad_configs WHERE client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())));

-- Triggers
CREATE TRIGGER ad_configs_updated_at BEFORE UPDATE ON ad_configs FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();
CREATE TRIGGER ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();
CREATE TRIGGER ad_copy_drafts_updated_at BEFORE UPDATE ON ad_copy_drafts FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();
