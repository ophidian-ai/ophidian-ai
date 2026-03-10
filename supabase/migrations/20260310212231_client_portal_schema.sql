-- Client Portal Schema Migration
-- Alters existing tables + creates new tables for the client portal

-- ============================================================
-- ALTER EXISTING: profiles (add company, website_url, update role constraint)
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url text;

-- Update role check: allow 'client' in addition to existing values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'user', 'client'));

-- ============================================================
-- ALTER EXISTING: clients (add columns needed by the portal app)
-- ============================================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ga4_property_id text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS search_console_url text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Backfill company_name from name for any existing rows
UPDATE clients SET company_name = name WHERE company_name IS NULL;

CREATE INDEX IF NOT EXISTS idx_clients_profile_id ON clients(profile_id);
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer_id ON clients(stripe_customer_id);

-- ============================================================
-- CREATE ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE service_type AS ENUM (
    'web_starter', 'web_professional', 'web_ecommerce',
    'seo_cleanup', 'seo_growth', 'maintenance'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE service_status AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('active', 'on_hold', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_phase AS ENUM ('discovery', 'design', 'development', 'review', 'live');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'approved', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_milestone AS ENUM ('deposit', 'midpoint', 'final', 'monthly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- ALTER EXISTING: projects (add portal columns)
-- ============================================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_service_id uuid;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS phase project_phase DEFAULT 'discovery';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS phase_updated_at timestamptz DEFAULT now();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estimated_completion date;

-- ============================================================
-- NEW TABLE: client_services
-- ============================================================
CREATE TABLE IF NOT EXISTS client_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_type service_type NOT NULL,
  status service_status NOT NULL DEFAULT 'active',
  monthly_amount integer,
  stripe_subscription_id text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_client_services_client_id ON client_services(client_id);

-- Add FK on projects.client_service_id -> client_services
DO $$ BEGIN
  ALTER TABLE projects ADD CONSTRAINT projects_client_service_id_fkey
    FOREIGN KEY (client_service_id) REFERENCES client_services(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- NEW TABLE: project_milestones
-- ============================================================
CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase project_phase NOT NULL,
  title text NOT NULL,
  description text,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones(project_id);

-- ============================================================
-- NEW TABLE: proposals
-- ============================================================
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  content jsonb NOT NULL DEFAULT '{}',
  payment_schedule jsonb NOT NULL DEFAULT '[]',
  status proposal_status NOT NULL DEFAULT 'draft',
  sent_at timestamptz,
  approved_at timestamptz,
  approved_by_ip text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_proposals_client_id ON proposals(client_id);

-- ============================================================
-- NEW TABLE: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_service_id uuid NOT NULL REFERENCES client_services(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  stripe_payment_intent_id text,
  amount integer NOT NULL,
  milestone_label payment_milestone NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================================
-- NEW TABLE: content_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS content_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  attachments text[] DEFAULT '{}',
  status request_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_content_requests_client_id ON content_requests(client_id);

-- ============================================================
-- NEW TABLE: client_analytics
-- ============================================================
CREATE TABLE IF NOT EXISTS client_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  page_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  bounce_rate numeric(5,2),
  avg_session_duration numeric(10,2),
  top_pages jsonb DEFAULT '[]',
  referral_sources jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, date)
);
CREATE INDEX IF NOT EXISTS idx_client_analytics_client_date ON client_analytics(client_id, date);

-- ============================================================
-- NEW TABLE: client_seo_metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS client_seo_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  avg_position numeric(6,2),
  ctr numeric(5,4),
  top_queries jsonb DEFAULT '[]',
  indexed_pages integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, date)
);
CREATE INDEX IF NOT EXISTS idx_client_seo_metrics_client_date ON client_seo_metrics(client_id, date);

-- ============================================================
-- NEW TABLE: reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_client_id ON reports(client_id);

-- ============================================================
-- HELPER FUNCTION: my_client_ids
-- ============================================================
CREATE OR REPLACE FUNCTION my_client_ids()
RETURNS SETOF uuid AS $$
  SELECT id FROM clients WHERE profile_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ROW LEVEL SECURITY on new tables
-- ============================================================
ALTER TABLE client_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_seo_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- clients: add client self-access (existing admin policy stays)
CREATE POLICY "clients_select_own" ON clients FOR SELECT USING (profile_id = auth.uid() OR is_admin());

-- client_services
CREATE POLICY "client_services_select" ON client_services FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "client_services_insert" ON client_services FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "client_services_update" ON client_services FOR UPDATE USING (is_admin());
CREATE POLICY "client_services_delete" ON client_services FOR DELETE USING (is_admin());

-- project_milestones
CREATE POLICY "milestones_select" ON project_milestones FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT my_client_ids())) OR is_admin()
);
CREATE POLICY "milestones_insert" ON project_milestones FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "milestones_update" ON project_milestones FOR UPDATE USING (is_admin());
CREATE POLICY "milestones_delete" ON project_milestones FOR DELETE USING (is_admin());

-- proposals
CREATE POLICY "proposals_select" ON proposals FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "proposals_insert" ON proposals FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "proposals_update_admin" ON proposals FOR UPDATE USING (is_admin());
CREATE POLICY "proposals_update_client" ON proposals FOR UPDATE USING (
  client_id IN (SELECT my_client_ids()) AND status = 'sent'
) WITH CHECK (status IN ('approved', 'declined'));
CREATE POLICY "proposals_delete" ON proposals FOR DELETE USING (is_admin());

-- payments
CREATE POLICY "payments_select" ON payments FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (is_admin());
CREATE POLICY "payments_delete" ON payments FOR DELETE USING (is_admin());

-- content_requests
CREATE POLICY "content_requests_select" ON content_requests FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "content_requests_insert" ON content_requests FOR INSERT WITH CHECK (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "content_requests_update" ON content_requests FOR UPDATE USING (is_admin());
CREATE POLICY "content_requests_delete" ON content_requests FOR DELETE USING (is_admin());

-- client_analytics
CREATE POLICY "analytics_select" ON client_analytics FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "analytics_insert" ON client_analytics FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "analytics_update" ON client_analytics FOR UPDATE USING (is_admin());

-- client_seo_metrics
CREATE POLICY "seo_metrics_select" ON client_seo_metrics FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "seo_metrics_insert" ON client_seo_metrics FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "seo_metrics_update" ON client_seo_metrics FOR UPDATE USING (is_admin());

-- reports
CREATE POLICY "reports_select" ON reports FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "reports_delete" ON reports FOR DELETE USING (is_admin());
