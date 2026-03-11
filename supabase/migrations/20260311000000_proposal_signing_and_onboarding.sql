-- Add revision_requested to proposal_status enum
ALTER TYPE proposal_status ADD VALUE IF NOT EXISTS 'revision_requested';

-- Add signing and signature columns to proposals
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS signing_token_hash text UNIQUE,
  ADD COLUMN IF NOT EXISTS signing_token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS typed_name text,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS document_hash text;

-- Add prospect status and missing columns to clients
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE clients ADD CONSTRAINT clients_status_check
  CHECK (status IN ('active', 'inactive', 'prospect'));

ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_name text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS onboarding_step text;

-- Proposal revisions table
CREATE TABLE IF NOT EXISTS proposal_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES auth.users(id),
  message text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE proposal_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY proposal_revisions_select_client ON proposal_revisions
  FOR SELECT USING (
    proposal_id IN (SELECT id FROM proposals WHERE client_id IN (SELECT my_client_ids()))
  );

CREATE POLICY proposal_revisions_insert_client ON proposal_revisions
  FOR INSERT WITH CHECK (
    proposal_id IN (SELECT id FROM proposals WHERE client_id IN (SELECT my_client_ids()) AND status = 'sent')
  );

CREATE POLICY proposal_revisions_admin ON proposal_revisions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Pending Iris tasks table
CREATE TABLE IF NOT EXISTS pending_iris_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message text,
  retry_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE pending_iris_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY pending_iris_tasks_admin ON pending_iris_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update RLS policy for proposals to allow revision_requested
DROP POLICY IF EXISTS proposals_update_client ON proposals;
CREATE POLICY proposals_update_client ON proposals
  FOR UPDATE USING (client_id IN (SELECT my_client_ids()) AND status = 'sent')
  WITH CHECK (status IN ('approved', 'declined', 'revision_requested'));
