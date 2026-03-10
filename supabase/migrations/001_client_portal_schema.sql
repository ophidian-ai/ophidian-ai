-- 001_client_portal_schema.sql
-- OphidianAI Client Portal Schema

-- ============================================================
-- MODIFY EXISTING: profiles table (add missing columns)
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url text;

-- ============================================================
-- NEW TABLE: clients
-- ============================================================
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_email text NOT NULL,
  website_url text,
  ga4_property_id text,
  search_console_url text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_clients_profile_id ON clients(profile_id);
CREATE INDEX idx_clients_stripe_customer_id ON clients(stripe_customer_id);

-- ============================================================
-- NEW TABLE: client_services
-- ============================================================
CREATE TYPE service_type AS ENUM (
  'web_starter', 'web_professional', 'web_ecommerce',
  'seo_cleanup', 'seo_growth', 'maintenance'
);

CREATE TYPE service_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE client_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_type service_type NOT NULL,
  status service_status NOT NULL DEFAULT 'active',
  monthly_amount integer, -- cents, nullable (only for retainer services)
  stripe_subscription_id text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_client_services_client_id ON client_services(client_id);

-- ============================================================
-- NEW TABLE: projects
-- ============================================================
CREATE TYPE project_status AS ENUM ('active', 'on_hold', 'cancelled', 'completed');
CREATE TYPE project_phase AS ENUM ('discovery', 'design', 'development', 'review', 'live');

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_service_id uuid NOT NULL REFERENCES client_services(id) ON DELETE CASCADE,
  status project_status NOT NULL DEFAULT 'active',
  phase project_phase NOT NULL DEFAULT 'discovery',
  phase_updated_at timestamptz DEFAULT now(),
  estimated_completion date,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_projects_client_id ON projects(client_id);

-- ============================================================
-- NEW TABLE: project_milestones
-- ============================================================
CREATE TABLE project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase project_phase NOT NULL,
  title text NOT NULL,
  description text,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_project_milestones_project_id ON project_milestones(project_id);

-- ============================================================
-- NEW TABLE: proposals
-- ============================================================
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'approved', 'declined');

CREATE TABLE proposals (
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

CREATE INDEX idx_proposals_client_id ON proposals(client_id);

-- ============================================================
-- NEW TABLE: payments
-- ============================================================
CREATE TYPE payment_milestone AS ENUM ('deposit', 'midpoint', 'final', 'monthly');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue');

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_service_id uuid NOT NULL REFERENCES client_services(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  stripe_payment_intent_id text,
  amount integer NOT NULL, -- cents
  milestone_label payment_milestone NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  due_date date,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- NEW TABLE: content_requests
-- ============================================================
CREATE TYPE request_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TABLE content_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  subject text NOT NULL,
  description text NOT NULL,
  attachments text[] DEFAULT '{}',
  status request_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_content_requests_client_id ON content_requests(client_id);

-- ============================================================
-- NEW TABLE: client_analytics (GA4 cached data)
-- ============================================================
CREATE TABLE client_analytics (
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

CREATE INDEX idx_client_analytics_client_date ON client_analytics(client_id, date);

-- ============================================================
-- NEW TABLE: client_seo_metrics (Search Console cached data)
-- ============================================================
CREATE TABLE client_seo_metrics (
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

CREATE INDEX idx_client_seo_metrics_client_date ON client_seo_metrics(client_id, date);

-- ============================================================
-- NEW TABLE: reports
-- ============================================================
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reports_client_id ON reports(client_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_seo_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get client IDs for current user
CREATE OR REPLACE FUNCTION my_client_ids()
RETURNS SETOF uuid AS $$
  SELECT id FROM clients WHERE profile_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- CLIENTS: read own, admin full access
CREATE POLICY "clients_select_own" ON clients FOR SELECT USING (profile_id = auth.uid() OR is_admin());
CREATE POLICY "clients_insert_admin" ON clients FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "clients_update_admin" ON clients FOR UPDATE USING (is_admin());
CREATE POLICY "clients_delete_admin" ON clients FOR DELETE USING (is_admin());

-- client_services
CREATE POLICY "client_services_select" ON client_services FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "client_services_insert" ON client_services FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "client_services_update" ON client_services FOR UPDATE USING (is_admin());
CREATE POLICY "client_services_delete" ON client_services FOR DELETE USING (is_admin());

-- projects
CREATE POLICY "projects_select" ON projects FOR SELECT USING (client_id IN (SELECT my_client_ids()) OR is_admin());
CREATE POLICY "projects_insert" ON projects FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "projects_update" ON projects FOR UPDATE USING (is_admin());
CREATE POLICY "projects_delete" ON projects FOR DELETE USING (is_admin());

-- project_milestones
CREATE POLICY "milestones_select" ON project_milestones FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT my_client_ids())) OR is_admin()
);
CREATE POLICY "milestones_insert" ON project_milestones FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "milestones_update" ON project_milestones FOR UPDATE USING (is_admin());
CREATE POLICY "milestones_delete" ON project_milestones FOR DELETE USING (is_admin());

-- proposals (clients can update status to approve/decline)
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

-- content_requests (clients can insert and read own)
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

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
