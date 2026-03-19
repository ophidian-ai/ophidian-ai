-- =============================================================================
-- CRM: Tables, Indexes, Functions, Triggers, and RLS
-- Migration: 20260319300000_crm_tables.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE crm_task_status AS ENUM ('pending', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- 1. crm_configs
CREATE TABLE crm_configs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tier                chatbot_tier NOT NULL DEFAULT 'essentials',
  max_pipelines       int NOT NULL DEFAULT 1,
  max_custom_fields   int NOT NULL DEFAULT 0,
  custom_fields       jsonb NOT NULL DEFAULT '[]',
  api_access          text NOT NULL DEFAULT 'none',
  active              boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- 2. crm_pipelines
CREATE TABLE crm_pipelines (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id   uuid NOT NULL REFERENCES crm_configs(id) ON DELETE CASCADE,
  name        text NOT NULL,
  stages      jsonb NOT NULL,
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. crm_deals
CREATE TABLE crm_deals (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id             uuid NOT NULL REFERENCES crm_configs(id) ON DELETE CASCADE,
  pipeline_id           uuid NOT NULL REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  contact_id            uuid NOT NULL REFERENCES email_contacts(id) ON DELETE CASCADE,
  title                 text NOT NULL,
  value                 numeric,
  stage                 text NOT NULL,
  probability           int NOT NULL DEFAULT 0,
  expected_close_at     date,
  won_at                timestamptz,
  lost_at               timestamptz,
  lost_reason           text,
  custom_field_values   jsonb,
  source                text NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- 4. crm_activities
CREATE TABLE crm_activities (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id                uuid NOT NULL REFERENCES crm_configs(id) ON DELETE CASCADE,
  contact_id               uuid NOT NULL REFERENCES email_contacts(id) ON DELETE CASCADE,
  deal_id                  uuid REFERENCES crm_deals(id) ON DELETE SET NULL,
  type                     text NOT NULL,
  description              text NOT NULL,
  linked_content_type      text,
  linked_content_id        uuid,
  auto_logged              boolean NOT NULL DEFAULT false,
  linked_content_available boolean NOT NULL DEFAULT true,
  created_at               timestamptz NOT NULL DEFAULT now()
);

-- 6. crm_automations (defined before crm_tasks so FK can reference it)
CREATE TABLE crm_automations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id       uuid NOT NULL REFERENCES crm_configs(id) ON DELETE CASCADE,
  name            text NOT NULL,
  trigger_type    text NOT NULL,
  trigger_config  jsonb NOT NULL,
  action_type     text NOT NULL,
  action_config   jsonb NOT NULL,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 5. crm_tasks
CREATE TABLE crm_tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id       uuid NOT NULL REFERENCES crm_configs(id) ON DELETE CASCADE,
  contact_id      uuid REFERENCES email_contacts(id) ON DELETE SET NULL,
  deal_id         uuid REFERENCES crm_deals(id) ON DELETE SET NULL,
  title           text NOT NULL,
  description     text,
  due_at          timestamptz NOT NULL,
  completed_at    timestamptz,
  status          crm_task_status NOT NULL DEFAULT 'pending',
  auto_generated  boolean NOT NULL DEFAULT false,
  automation_id   uuid REFERENCES crm_automations(id) ON DELETE SET NULL,
  reminder_sent   boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_crm_deals_config_pipeline
  ON crm_deals (config_id, pipeline_id);

CREATE INDEX idx_crm_deals_contact_id
  ON crm_deals (contact_id);

CREATE INDEX idx_crm_activities_contact_created
  ON crm_activities (contact_id, created_at DESC);

CREATE INDEX idx_crm_activities_config_deal
  ON crm_activities (config_id, deal_id);

CREATE INDEX idx_crm_tasks_config_status_due
  ON crm_tasks (config_id, status, due_at);

CREATE INDEX idx_crm_automations_config_trigger
  ON crm_automations (config_id, trigger_type);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER crm_configs_updated_at
  BEFORE UPDATE ON crm_configs
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER crm_deals_updated_at
  BEFORE UPDATE ON crm_deals
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER crm_tasks_updated_at
  BEFORE UPDATE ON crm_tasks
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE crm_configs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_pipelines    ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_automations  ENABLE ROW LEVEL SECURITY;

-- Admin full access -----------------------------------------------------------

CREATE POLICY admin_all_crm_configs
  ON crm_configs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_crm_pipelines
  ON crm_pipelines FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_crm_deals
  ON crm_deals FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_crm_activities
  ON crm_activities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_crm_tasks
  ON crm_tasks FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_crm_automations
  ON crm_automations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Client read access (own data via client_id chain) ---------------------------

CREATE POLICY client_select_crm_configs
  ON crm_configs FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid()));

CREATE POLICY client_select_crm_pipelines
  ON crm_pipelines FOR SELECT
  USING (config_id IN (
    SELECT cc.id FROM crm_configs cc
    WHERE cc.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

CREATE POLICY client_select_crm_deals
  ON crm_deals FOR SELECT
  USING (config_id IN (
    SELECT cc.id FROM crm_configs cc
    WHERE cc.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

CREATE POLICY client_select_crm_activities
  ON crm_activities FOR SELECT
  USING (config_id IN (
    SELECT cc.id FROM crm_configs cc
    WHERE cc.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

CREATE POLICY client_select_crm_tasks
  ON crm_tasks FOR SELECT
  USING (config_id IN (
    SELECT cc.id FROM crm_configs cc
    WHERE cc.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

CREATE POLICY client_select_crm_automations
  ON crm_automations FOR SELECT
  USING (config_id IN (
    SELECT cc.id FROM crm_configs cc
    WHERE cc.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));
