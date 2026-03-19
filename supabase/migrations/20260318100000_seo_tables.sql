-- SEO Automation Tables
-- Task 2: seo_configs, seo_audits, seo_rankings, seo_gbp_drafts

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE seo_tier AS ENUM ('essentials', 'growth', 'pro');
CREATE TYPE gbp_draft_status AS ENUM ('draft', 'approved', 'expired');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE seo_configs (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      uuid        REFERENCES clients(id) ON DELETE SET NULL,
  url            text        NOT NULL,
  industry       text,
  location       text,
  tier           seo_tier    NOT NULL DEFAULT 'essentials',
  target_keywords text[]     NOT NULL DEFAULT '{}',
  competitors    jsonb       NOT NULL DEFAULT '[]',
  gbp_url        text,
  delivery_email text        NOT NULL,
  active         boolean     NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE seo_audits (
  id               uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id        uuid  NOT NULL REFERENCES seo_configs(id) ON DELETE CASCADE,
  date             date  NOT NULL,
  score_onpage     int   NOT NULL DEFAULT 0,
  score_technical  int   NOT NULL DEFAULT 0,
  score_content    int   NOT NULL DEFAULT 0,
  score_local      int   NOT NULL DEFAULT 0,
  score_speed      int   NOT NULL DEFAULT 0,
  score_ai_visibility int NOT NULL DEFAULT 0,
  issues           jsonb NOT NULL DEFAULT '[]',
  recommendations  jsonb NOT NULL DEFAULT '[]',
  ai_insights      text,
  report_url       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (config_id, date)
);

CREATE TABLE seo_rankings (
  id                   uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id            uuid    NOT NULL REFERENCES seo_configs(id) ON DELETE CASCADE,
  date                 date    NOT NULL,
  keyword              text    NOT NULL,
  position             text    NOT NULL DEFAULT 'not-found',
  ai_overview          boolean NOT NULL DEFAULT false,
  competitor_positions jsonb,
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (config_id, date, keyword)
);

CREATE TABLE seo_gbp_drafts (
  id            uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id     uuid             NOT NULL REFERENCES seo_configs(id) ON DELETE CASCADE,
  source_url    text             NOT NULL,
  content       text             NOT NULL,
  keywords_used text[]           NOT NULL DEFAULT '{}',
  status        gbp_draft_status NOT NULL DEFAULT 'draft',
  expires_at    timestamptz      NOT NULL,
  created_at    timestamptz      NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_seo_configs_client             ON seo_configs(client_id);
CREATE INDEX idx_seo_configs_active             ON seo_configs(active) WHERE active = true;
CREATE INDEX idx_seo_audits_config              ON seo_audits(config_id);
CREATE UNIQUE INDEX idx_seo_audits_config_date  ON seo_audits(config_id, date);
CREATE INDEX idx_seo_rankings_config            ON seo_rankings(config_id);
CREATE UNIQUE INDEX idx_seo_rankings_config_date_keyword ON seo_rankings(config_id, date, keyword);
CREATE INDEX idx_seo_gbp_drafts_config          ON seo_gbp_drafts(config_id);

-- ============================================================
-- TRIGGER (reuse update_chatbot_updated_at from chatbot migration)
-- ============================================================

CREATE TRIGGER seo_configs_updated_at
  BEFORE UPDATE ON seo_configs
  FOR EACH ROW EXECUTE FUNCTION update_chatbot_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE seo_configs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_rankings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_gbp_drafts ENABLE ROW LEVEL SECURITY;

-- Admin: full access on seo_configs
CREATE POLICY "admin_all_seo_configs" ON seo_configs
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin: full access on seo_audits
CREATE POLICY "admin_all_seo_audits" ON seo_audits
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin: full access on seo_rankings
CREATE POLICY "admin_all_seo_rankings" ON seo_rankings
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin: full access on seo_gbp_drafts
CREATE POLICY "admin_all_seo_gbp_drafts" ON seo_gbp_drafts
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Client: read own seo_configs
CREATE POLICY "client_read_own_seo_configs" ON seo_configs
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE profile_id = auth.uid()
    )
  );

-- Client: read own seo_audits
CREATE POLICY "client_read_own_seo_audits" ON seo_audits
  FOR SELECT
  USING (
    config_id IN (
      SELECT id FROM seo_configs
      WHERE client_id IN (
        SELECT id FROM clients WHERE profile_id = auth.uid()
      )
    )
  );

-- Client: read own seo_rankings
CREATE POLICY "client_read_own_seo_rankings" ON seo_rankings
  FOR SELECT
  USING (
    config_id IN (
      SELECT id FROM seo_configs
      WHERE client_id IN (
        SELECT id FROM clients WHERE profile_id = auth.uid()
      )
    )
  );

-- Client: read own seo_gbp_drafts
CREATE POLICY "client_read_own_seo_gbp_drafts" ON seo_gbp_drafts
  FOR SELECT
  USING (
    config_id IN (
      SELECT id FROM seo_configs
      WHERE client_id IN (
        SELECT id FROM clients WHERE profile_id = auth.uid()
      )
    )
  );

-- Client: update own seo_gbp_drafts (for draft approval)
CREATE POLICY "client_update_own_seo_gbp_drafts" ON seo_gbp_drafts
  FOR UPDATE
  USING (
    config_id IN (
      SELECT id FROM seo_configs
      WHERE client_id IN (
        SELECT id FROM clients WHERE profile_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    config_id IN (
      SELECT id FROM seo_configs
      WHERE client_id IN (
        SELECT id FROM clients WHERE profile_id = auth.uid()
      )
    )
  );
