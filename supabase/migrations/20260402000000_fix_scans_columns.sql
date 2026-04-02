-- Fix scans table column names to match application code.
-- The original migration used short names (score, grade, results_json)
-- but the scan engine and API routes use overall_score, overall_grade,
-- result, and estimated_monthly_leak.

alter table public.scans rename column score to overall_score;
alter table public.scans rename column grade to overall_grade;
alter table public.scans rename column results_json to result;

alter table public.scans
  add column if not exists estimated_monthly_leak integer;
