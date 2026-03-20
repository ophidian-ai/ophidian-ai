-- Add 'launched' to the project_status enum so projects can be marked live
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'launched';
