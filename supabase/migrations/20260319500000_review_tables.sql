-- =============================================================================
-- Review Management: Tables, Indexes, Functions, Triggers, and RLS
-- Migration: 20260319500000_review_tables.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE review_response_status AS ENUM ('draft', 'approved', 'posted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE review_campaign_status AS ENUM ('draft', 'scheduled', 'sent', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- 1. review_configs
CREATE TABLE review_configs (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id               uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tier                    chatbot_tier NOT NULL DEFAULT 'essentials',
  gbp_account_id          text,
  gbp_location_id         text,
  gbp_oauth_token         text,
  yelp_url                text,
  facebook_page_id        text,
  brand_voice             jsonb NOT NULL DEFAULT '{"tone": "professional", "guidelines": "", "signoff": ""}',
  auto_respond_positive   boolean NOT NULL DEFAULT false,
  auto_respond_negative   boolean NOT NULL DEFAULT false,
  escalation_email        text,
  competitor_gbp_ids      text[] NOT NULL DEFAULT '{}',
  notification_email      text NOT NULL,
  active                  boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- 2. reviews
CREATE TABLE reviews (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id           uuid NOT NULL REFERENCES review_configs(id) ON DELETE CASCADE,
  platform            text NOT NULL,
  platform_review_id  text NOT NULL,
  author_name         text NOT NULL,
  author_image_url    text,
  rating              int NOT NULL,
  text                text,
  review_date         timestamptz NOT NULL,
  sentiment           text,
  response_status     text NOT NULL DEFAULT 'pending',
  is_competitor       boolean NOT NULL DEFAULT false,
  competitor_name     text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (config_id, platform, platform_review_id)
);

-- 3. review_responses
CREATE TABLE review_responses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id       uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  config_id       uuid NOT NULL REFERENCES review_configs(id) ON DELETE CASCADE,
  generated_text  text NOT NULL,
  final_text      text,
  status          review_response_status NOT NULL DEFAULT 'draft',
  auto_posted     boolean NOT NULL DEFAULT false,
  posted_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 4. review_campaigns
CREATE TABLE review_campaigns (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id           uuid NOT NULL REFERENCES review_configs(id) ON DELETE CASCADE,
  name                text NOT NULL,
  review_link         text NOT NULL,
  contacts_targeted   int NOT NULL DEFAULT 0,
  emails_sent         int NOT NULL DEFAULT 0,
  emails_opened       int NOT NULL DEFAULT 0,
  link_clicked        int NOT NULL DEFAULT 0,
  reviews_attributed  int NOT NULL DEFAULT 0,
  status              review_campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at        timestamptz,
  sent_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- 5. review_analytics
CREATE TABLE review_analytics (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id           uuid NOT NULL REFERENCES review_configs(id) ON DELETE CASCADE,
  date                date NOT NULL,
  platform            text NOT NULL,
  total_reviews       int NOT NULL DEFAULT 0,
  average_rating      real NOT NULL DEFAULT 0,
  new_reviews         int NOT NULL DEFAULT 0,
  responses_posted    int NOT NULL DEFAULT 0,
  response_rate       real NOT NULL DEFAULT 0,
  sentiment_positive  int NOT NULL DEFAULT 0,
  sentiment_neutral   int NOT NULL DEFAULT 0,
  sentiment_negative  int NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (config_id, date, platform)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_reviews_config_platform_created
  ON reviews (config_id, platform, created_at DESC);

CREATE INDEX idx_reviews_config_response_status
  ON reviews (config_id, response_status);

CREATE INDEX idx_review_responses_review_id
  ON review_responses (review_id);

CREATE INDEX idx_review_analytics_config_date
  ON review_analytics (config_id, date);

CREATE INDEX idx_review_campaigns_config_id
  ON review_campaigns (config_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER review_configs_updated_at
  BEFORE UPDATE ON review_configs
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER review_responses_updated_at
  BEFORE UPDATE ON review_responses
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER review_campaigns_updated_at
  BEFORE UPDATE ON review_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE review_configs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_campaigns  ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_analytics  ENABLE ROW LEVEL SECURITY;

-- Admin full access -----------------------------------------------------------

CREATE POLICY admin_all_review_configs
  ON review_configs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_reviews
  ON reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_review_responses
  ON review_responses FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_review_campaigns
  ON review_campaigns FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_review_analytics
  ON review_analytics FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Client read access (own data via config_id -> client_id chain) --------------

CREATE POLICY client_select_review_configs
  ON review_configs FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid()));

CREATE POLICY client_select_reviews
  ON reviews FOR SELECT
  USING (config_id IN (
    SELECT rc.id FROM review_configs rc
    WHERE rc.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

CREATE POLICY client_select_review_responses
  ON review_responses FOR SELECT
  USING (config_id IN (
    SELECT rc.id FROM review_configs rc
    WHERE rc.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

CREATE POLICY client_select_review_campaigns
  ON review_campaigns FOR SELECT
  USING (config_id IN (
    SELECT rc.id FROM review_configs rc
    WHERE rc.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

CREATE POLICY client_select_review_analytics
  ON review_analytics FOR SELECT
  USING (config_id IN (
    SELECT rc.id FROM review_configs rc
    WHERE rc.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

-- Client update access for approve/edit actions on review_responses -----------

CREATE POLICY client_update_review_responses
  ON review_responses FOR UPDATE
  USING (config_id IN (
    SELECT rc.id FROM review_configs rc
    WHERE rc.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ))
  WITH CHECK (config_id IN (
    SELECT rc.id FROM review_configs rc
    WHERE rc.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));
