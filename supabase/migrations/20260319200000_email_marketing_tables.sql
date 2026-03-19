-- =============================================================================
-- Email Marketing: Tables, Indexes, Functions, Triggers, RLS, and Seed Data
-- Migration: 20260319200000_email_marketing_tables.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE email_campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE email_enrollment_status AS ENUM ('active', 'completed', 'paused', 'unsubscribed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE email_recipient_status AS ENUM ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- 1. email_configs
CREATE TABLE email_configs (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                 uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  tier                      chatbot_tier NOT NULL DEFAULT 'essentials',
  sending_domain            text,
  sending_domain_verified   boolean NOT NULL DEFAULT false,
  from_name                 text,
  from_email                text,
  brand_config              jsonb NOT NULL DEFAULT '{}',
  monthly_send_limit        int NOT NULL DEFAULT 1000,
  sends_this_month          int NOT NULL DEFAULT 0,
  max_contacts              int NOT NULL DEFAULT 500,
  campaigns_this_month      int NOT NULL DEFAULT 0,
  max_active_sequences      int NOT NULL DEFAULT 2,
  api_key_hash              text,
  unsubscribe_secret        text NOT NULL,
  active                    boolean NOT NULL DEFAULT true,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

-- 2. email_contacts
CREATE TABLE email_contacts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  email             text NOT NULL,
  name              text,
  phone             text,
  tags              text[] NOT NULL DEFAULT '{}',
  source            text,
  engagement_score  int NOT NULL DEFAULT 0,
  last_engaged_at   timestamptz,
  subscribed        boolean NOT NULL DEFAULT true,
  unsubscribed_at   timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, email)
);

-- 3. email_templates
CREATE TABLE email_templates (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id        uuid REFERENCES email_configs(id) ON DELETE CASCADE,
  name             text NOT NULL,
  category         text NOT NULL,
  subject_template text NOT NULL,
  html_template    text NOT NULL,
  is_base          boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 4. email_campaigns
CREATE TABLE email_campaigns (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id        uuid NOT NULL REFERENCES email_configs(id) ON DELETE CASCADE,
  template_id      uuid NOT NULL REFERENCES email_templates(id),
  name             text NOT NULL,
  subject          text NOT NULL,
  subject_variants text[],
  winning_variant  int,
  ab_metric        text NOT NULL DEFAULT 'open_rate',
  content          text NOT NULL,
  segment_filter   jsonb,
  scheduled_at     timestamptz,
  sent_at          timestamptz,
  status           email_campaign_status NOT NULL DEFAULT 'draft',
  stats            jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 5. email_campaign_recipients
CREATE TABLE email_campaign_recipients (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id        uuid NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id         uuid NOT NULL REFERENCES email_contacts(id) ON DELETE CASCADE,
  resend_message_id  text,
  variant_index      int,
  status             email_recipient_status NOT NULL DEFAULT 'pending',
  link_clicks        jsonb,
  sent_at            timestamptz,
  opened_at          timestamptz,
  clicked_at         timestamptz
);

-- 6. email_sequences
CREATE TABLE email_sequences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id       uuid NOT NULL REFERENCES email_configs(id) ON DELETE CASCADE,
  name            text NOT NULL,
  trigger_type    text NOT NULL,
  trigger_config  jsonb NOT NULL,
  steps           jsonb NOT NULL,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 7. email_sequence_enrollments
CREATE TABLE email_sequence_enrollments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id   uuid NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  contact_id    uuid NOT NULL REFERENCES email_contacts(id) ON DELETE CASCADE,
  current_step  int NOT NULL DEFAULT 0,
  status        email_enrollment_status NOT NULL DEFAULT 'active',
  next_send_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Partial unique: one active enrollment per contact per sequence.
-- Completed/paused enrollments are retained; re-enrollment creates a new row.
CREATE UNIQUE INDEX idx_email_sequence_enrollments_active
  ON email_sequence_enrollments (sequence_id, contact_id)
  WHERE status = 'active';

-- 8. email_events
CREATE TABLE email_events (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_message_id  text NOT NULL,
  event_type         text NOT NULL,
  payload            jsonb NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_email_configs_client_id
  ON email_configs (client_id);

CREATE INDEX idx_email_contacts_client_id
  ON email_contacts (client_id);

CREATE INDEX idx_email_campaign_recipients_resend_message_id
  ON email_campaign_recipients (resend_message_id);

CREATE INDEX idx_email_campaign_recipients_campaign_status
  ON email_campaign_recipients (campaign_id, status);

CREATE INDEX idx_email_events_resend_message_id
  ON email_events (resend_message_id);

CREATE INDEX idx_email_sequence_enrollments_status_next_send
  ON email_sequence_enrollments (status, next_send_at);

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

-- Atomically increment sends_this_month by p_batch_size.
-- Returns TRUE if within the monthly limit, FALSE if the limit would be exceeded.
CREATE OR REPLACE FUNCTION increment_and_check_send_limit(p_config_id UUID, p_batch_size INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated_id uuid;
BEGIN
  UPDATE email_configs
  SET sends_this_month = sends_this_month + p_batch_size
  WHERE id = p_config_id
    AND sends_this_month + p_batch_size <= monthly_send_limit
  RETURNING id INTO v_updated_id;

  RETURN v_updated_id IS NOT NULL;
END;
$$;

-- Reset sends_this_month and campaigns_this_month to 0 for all active configs.
-- Intended to be called by a monthly cron job.
CREATE OR REPLACE FUNCTION reset_email_monthly_counters()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE email_configs
  SET sends_this_month     = 0,
      campaigns_this_month = 0
  WHERE active = true;
END;
$$;

-- Generic updated_at trigger function for email tables.
-- Reuses the same pattern as update_chatbot_updated_at.
CREATE OR REPLACE FUNCTION update_email_updated_at()
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

CREATE TRIGGER email_configs_updated_at
  BEFORE UPDATE ON email_configs
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER email_contacts_updated_at
  BEFORE UPDATE ON email_contacts
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

CREATE TRIGGER email_sequence_enrollments_updated_at
  BEFORE UPDATE ON email_sequence_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE email_configs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_contacts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates              ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns              ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients    ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences              ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequence_enrollments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events                 ENABLE ROW LEVEL SECURITY;

-- Admin full access -----------------------------------------------------------

CREATE POLICY admin_all_email_configs
  ON email_configs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_email_contacts
  ON email_contacts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_email_templates
  ON email_templates FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_email_campaigns
  ON email_campaigns FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_email_campaign_recipients
  ON email_campaign_recipients FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_email_sequences
  ON email_sequences FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_email_sequence_enrollments
  ON email_sequence_enrollments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY admin_all_email_events
  ON email_events FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Client read access (own data via client_id chain) ---------------------------

CREATE POLICY client_select_email_configs
  ON email_configs FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid()));

CREATE POLICY client_select_email_contacts
  ON email_contacts FOR SELECT
  USING (client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid()));

CREATE POLICY client_select_email_templates
  ON email_templates FOR SELECT
  USING (
    is_base = true
    OR config_id IN (
      SELECT ec.id FROM email_configs ec
      WHERE ec.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY client_select_email_campaigns
  ON email_campaigns FOR SELECT
  USING (config_id IN (
    SELECT ec.id FROM email_configs ec
    WHERE ec.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

CREATE POLICY client_select_email_campaign_recipients
  ON email_campaign_recipients FOR SELECT
  USING (campaign_id IN (
    SELECT c.id FROM email_campaigns c
    JOIN email_configs ec ON ec.id = c.config_id
    WHERE ec.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

CREATE POLICY client_select_email_sequences
  ON email_sequences FOR SELECT
  USING (config_id IN (
    SELECT ec.id FROM email_configs ec
    WHERE ec.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

CREATE POLICY client_select_email_sequence_enrollments
  ON email_sequence_enrollments FOR SELECT
  USING (sequence_id IN (
    SELECT s.id FROM email_sequences s
    JOIN email_configs ec ON ec.id = s.config_id
    WHERE ec.client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())
  ));

-- email_events has no client_id chain; admin-only access is sufficient.
-- No client SELECT policy on email_events.

-- ---------------------------------------------------------------------------
-- Base Templates (Seed Data)
-- ---------------------------------------------------------------------------

INSERT INTO email_templates (id, config_id, name, category, subject_template, html_template, is_base)
VALUES
  (
    gen_random_uuid(),
    NULL,
    'Newsletter',
    'newsletter',
    'Newsletter: {{subject}}',
    '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Newsletter</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f4; font-family: Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #1a1a2e; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
    .body { padding: 32px; color: #333333; line-height: 1.6; }
    .body h2 { color: #1a1a2e; }
    .footer { background: #f4f4f4; padding: 16px 32px; text-align: center; font-size: 12px; color: #888888; }
    .footer a { color: #888888; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>{{company_name}}</h1></div>
    <div class="body">
      <h2>Hello, {{name}}!</h2>
      {{content}}
    </div>
    <div class="footer">
      <p>{{footer_text}}</p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>',
    true
  ),
  (
    gen_random_uuid(),
    NULL,
    'Promotion',
    'promotion',
    'Special Offer: {{subject}}',
    '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Promotion</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f4; font-family: Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #1a1a2e; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
    .hero { background: #39ff14; padding: 32px; text-align: center; }
    .hero h2 { color: #1a1a2e; margin: 0 0 8px; font-size: 28px; }
    .hero p { color: #1a1a2e; margin: 0; font-size: 16px; }
    .body { padding: 32px; color: #333333; line-height: 1.6; }
    .cta { display: block; width: fit-content; margin: 24px auto; padding: 14px 32px; background: #1a1a2e; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .footer { background: #f4f4f4; padding: 16px 32px; text-align: center; font-size: 12px; color: #888888; }
    .footer a { color: #888888; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>{{company_name}}</h1></div>
    <div class="hero">
      <h2>{{promo_headline}}</h2>
      <p>{{promo_subheadline}}</p>
    </div>
    <div class="body">
      <p>Hi {{name}},</p>
      {{content}}
      <a class="cta" href="{{cta_url}}">{{cta_text}}</a>
    </div>
    <div class="footer">
      <p>{{footer_text}}</p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>',
    true
  ),
  (
    gen_random_uuid(),
    NULL,
    'Announcement',
    'announcement',
    'Announcement: {{subject}}',
    '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Announcement</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f4; font-family: Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #1a1a2e; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
    .banner { background: #e8f4ff; border-left: 4px solid #1a1a2e; padding: 16px 32px; }
    .banner p { margin: 0; color: #1a1a2e; font-weight: bold; font-size: 15px; }
    .body { padding: 32px; color: #333333; line-height: 1.6; }
    .footer { background: #f4f4f4; padding: 16px 32px; text-align: center; font-size: 12px; color: #888888; }
    .footer a { color: #888888; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>{{company_name}}</h1></div>
    <div class="banner"><p>{{announcement_label}}</p></div>
    <div class="body">
      <p>Hi {{name}},</p>
      {{content}}
    </div>
    <div class="footer">
      <p>{{footer_text}}</p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>',
    true
  ),
  (
    gen_random_uuid(),
    NULL,
    'Sequence Step',
    'sequence_step',
    '{{subject}}',
    '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f4; font-family: Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #1a1a2e; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
    .body { padding: 32px; color: #333333; line-height: 1.6; }
    .footer { background: #f4f4f4; padding: 16px 32px; text-align: center; font-size: 12px; color: #888888; }
    .footer a { color: #888888; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>{{company_name}}</h1></div>
    <div class="body">
      <p>Hi {{name}},</p>
      {{content}}
    </div>
    <div class="footer">
      <p>{{footer_text}}</p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>',
    true
  );
