-- =============================================================================
-- Chatbot Widget: Database Tables, Indexes, Functions, Triggers, and RLS
-- Migration: 20260318000000_chatbot_tables.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------------

CREATE TYPE chatbot_tier AS ENUM ('essentials', 'growth', 'pro');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- 1. chatbot_configs
CREATE TABLE chatbot_configs (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                 uuid REFERENCES clients(id) ON DELETE SET NULL,
  slug                      text UNIQUE NOT NULL,
  tier                      chatbot_tier NOT NULL DEFAULT 'essentials',
  model                     text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  system_prompt             text NOT NULL,
  greeting                  text NOT NULL DEFAULT 'Hi! How can I help you today?',
  knowledge_source          jsonb NOT NULL DEFAULT '{"type": "namespace", "name": ""}',
  theme                     jsonb NOT NULL DEFAULT '{"primaryColor": "#39ff14", "position": "bottom-right", "logoUrl": null}',
  allowed_origins           text[] NOT NULL DEFAULT '{}',
  conversation_count_month  int NOT NULL DEFAULT 0,
  lead_capture              jsonb NOT NULL DEFAULT '{"enabled": true, "mode": "message_count", "trigger_after": 3, "fields": ["name", "email"]}',
  fallback_contact          jsonb NOT NULL DEFAULT '{"phone": null, "email": null, "address": null}',
  page_limit                int DEFAULT 50,
  api_key_hash              text,
  is_demo                   boolean NOT NULL DEFAULT false,
  demo_expires_at           timestamptz,
  active                    boolean NOT NULL DEFAULT true,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

-- 2. chatbot_conversations
CREATE TABLE chatbot_conversations (
  id              uuid PRIMARY KEY,
  config_id       uuid NOT NULL REFERENCES chatbot_configs(id) ON DELETE CASCADE,
  session_id      text NOT NULL,
  message_count   int NOT NULL DEFAULT 0,
  page_url        text,
  visitor_token   text,
  lead_captured   boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (config_id, session_id)
);

-- 3. chatbot_messages (append-only)
CREATE TABLE chatbot_messages (
  id               uuid PRIMARY KEY,
  conversation_id  uuid NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  role             text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content          text NOT NULL,
  metadata         jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- 4. chatbot_leads
CREATE TABLE chatbot_leads (
  id               uuid PRIMARY KEY,
  config_id        uuid NOT NULL REFERENCES chatbot_configs(id) ON DELETE CASCADE,
  conversation_id  uuid NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  name             text,
  email            text,
  phone            text,
  custom_fields    jsonb,
  source_page      text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- 5. chatbot_analytics
CREATE TABLE chatbot_analytics (
  id                             uuid PRIMARY KEY,
  config_id                      uuid NOT NULL REFERENCES chatbot_configs(id) ON DELETE CASCADE,
  date                           date NOT NULL,
  conversations_count            int NOT NULL DEFAULT 0,
  messages_count                 int NOT NULL DEFAULT 0,
  leads_captured                 int NOT NULL DEFAULT 0,
  avg_messages_per_conversation  real NOT NULL DEFAULT 0,
  top_questions                  jsonb,
  created_at                     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (config_id, date)
);

-- 6. chatbot_webhook_failures
CREATE TABLE chatbot_webhook_failures (
  id          uuid PRIMARY KEY,
  config_id   uuid NOT NULL REFERENCES chatbot_configs(id) ON DELETE CASCADE,
  event_type  text NOT NULL,
  payload     jsonb NOT NULL,
  attempts    int NOT NULL DEFAULT 0,
  last_error  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_chatbot_configs_slug
  ON chatbot_configs(slug)
  WHERE active = true;

CREATE INDEX idx_chatbot_configs_client
  ON chatbot_configs(client_id);

CREATE INDEX idx_chatbot_conversations_config
  ON chatbot_conversations(config_id);

CREATE UNIQUE INDEX idx_chatbot_conversations_config_session
  ON chatbot_conversations(config_id, session_id);

CREATE INDEX idx_chatbot_messages_conversation
  ON chatbot_messages(conversation_id, created_at);

CREATE INDEX idx_chatbot_leads_config
  ON chatbot_leads(config_id);

CREATE INDEX idx_chatbot_analytics_config_date
  ON chatbot_analytics(config_id, date);

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

-- Atomically increment conversation_count_month.
-- Returns TRUE if within cap, FALSE if cap is exceeded (rolls back increment).
CREATE OR REPLACE FUNCTION increment_and_check_cap(p_config_id UUID, p_cap INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_count int;
BEGIN
  UPDATE chatbot_configs
  SET conversation_count_month = conversation_count_month + 1
  WHERE id = p_config_id
  RETURNING conversation_count_month INTO v_new_count;

  IF v_new_count > p_cap THEN
    -- Roll back the increment
    UPDATE chatbot_configs
    SET conversation_count_month = conversation_count_month - 1
    WHERE id = p_config_id;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- Reset conversation_count_month to 0 for all active configs.
CREATE OR REPLACE FUNCTION reset_monthly_conversation_counts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE chatbot_configs
  SET conversation_count_month = 0
  WHERE active = true;
END;
$$;

-- Upsert into chatbot_analytics and increment leads_captured for the given config + date.
CREATE OR REPLACE FUNCTION increment_daily_leads(p_config_id UUID, p_date DATE)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO chatbot_analytics (id, config_id, date, leads_captured)
  VALUES (gen_random_uuid(), p_config_id, p_date, 1)
  ON CONFLICT (config_id, date)
  DO UPDATE SET leads_captured = chatbot_analytics.leads_captured + 1;
END;
$$;

-- Trigger function: set updated_at = now()
CREATE OR REPLACE FUNCTION update_chatbot_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER chatbot_configs_updated_at
  BEFORE UPDATE ON chatbot_configs
  FOR EACH ROW EXECUTE FUNCTION update_chatbot_updated_at();

CREATE TRIGGER chatbot_conversations_updated_at
  BEFORE UPDATE ON chatbot_conversations
  FOR EACH ROW EXECUTE FUNCTION update_chatbot_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE chatbot_configs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_leads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_analytics         ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_webhook_failures  ENABLE ROW LEVEL SECURITY;

-- Admin full access ----------------------------------------------------------

CREATE POLICY admin_all_chatbot_configs
  ON chatbot_configs
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_chatbot_conversations
  ON chatbot_conversations
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_chatbot_messages
  ON chatbot_messages
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_chatbot_leads
  ON chatbot_leads
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_chatbot_analytics
  ON chatbot_analytics
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_chatbot_webhook_failures
  ON chatbot_webhook_failures
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Client read access (own data) ----------------------------------------------

CREATE POLICY client_select_chatbot_configs
  ON chatbot_configs
  FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid()));

CREATE POLICY client_select_chatbot_analytics
  ON chatbot_analytics
  FOR SELECT
  USING (config_id IN (
    SELECT id FROM chatbot_configs
    WHERE client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

-- Anon insert for widget visitors --------------------------------------------

CREATE POLICY anon_insert_chatbot_conversations
  ON chatbot_conversations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY anon_insert_chatbot_messages
  ON chatbot_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY anon_insert_chatbot_leads
  ON chatbot_leads
  FOR INSERT
  TO anon
  WITH CHECK (true);
