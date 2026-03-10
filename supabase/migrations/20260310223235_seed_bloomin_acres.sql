-- Seed Bloomin' Acres as a test client/project
-- This is a real, active (free) project for Christina Lefler

-- Add missing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS notes text;

-- Clean up partial data from failed first attempt
DELETE FROM clients WHERE id = 'b100a000-0000-4000-8000-000000000001';

-- Create client record (no profile_id since Christina doesn't have a dashboard login yet)
INSERT INTO clients (id, name, company_name, contact_email, website_url, status, created_at, updated_at)
VALUES (
  'b100a000-0000-4000-8000-000000000001',
  'Bloomin'' Acres Market',
  'Bloomin'' Acres Market',
  'c.lefler@bloominacresgreens.net',
  'https://bloominacresmarket.com',
  'active',
  '2026-02-15T00:00:00Z',
  now()
);

-- Create client_service (web_starter -- free project, no monthly amount)
INSERT INTO client_services (id, client_id, service_type, status, monthly_amount, started_at)
VALUES (
  'b100a000-0000-4000-8000-000000000002',
  'b100a000-0000-4000-8000-000000000001',
  'web_starter',
  'active',
  0,
  '2026-02-15T00:00:00Z'
);

-- Create project in development phase
INSERT INTO projects (id, client_id, client_service_id, name, status, phase, phase_updated_at, estimated_completion, notes, created_at)
VALUES (
  'b100a000-0000-4000-8000-000000000003',
  'b100a000-0000-4000-8000-000000000001',
  'b100a000-0000-4000-8000-000000000002',
  'Bloomin'' Acres Website',
  'active',
  'development',
  now(),
  '2026-04-01',
  'Free project -- building portfolio. Sourdough bread and fresh produce business in Hope, IN.',
  '2026-02-15T00:00:00Z'
);

-- Create milestones
INSERT INTO project_milestones (project_id, phase, title, description, due_date, completed_at) VALUES
  ('b100a000-0000-4000-8000-000000000003', 'discovery', 'Client intake and brand assets', 'Gathered logo, photos, menu, business info', '2026-02-20', '2026-02-20T00:00:00Z'),
  ('b100a000-0000-4000-8000-000000000003', 'design', 'Homepage design', 'Hero, about section, product highlights, contact', '2026-03-01', '2026-03-01T00:00:00Z'),
  ('b100a000-0000-4000-8000-000000000003', 'design', 'Inner pages design', 'Menu, product detail, club page, account page', '2026-03-05', '2026-03-05T00:00:00Z'),
  ('b100a000-0000-4000-8000-000000000003', 'development', 'Build all pages', 'HTML/CSS/JS build for all pages', '2026-03-15', NULL),
  ('b100a000-0000-4000-8000-000000000003', 'development', 'Supabase integration', 'Auth, product management, club subscriptions', '2026-03-20', NULL),
  ('b100a000-0000-4000-8000-000000000003', 'review', 'Client review and feedback', 'Christina reviews and provides feedback', '2026-03-25', NULL),
  ('b100a000-0000-4000-8000-000000000003', 'live', 'Deploy to production', 'Final deploy to Vercel with custom domain', '2026-04-01', NULL);
