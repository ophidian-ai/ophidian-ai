-- Add maintenance phase for post-launch project support
ALTER TYPE project_phase ADD VALUE 'maintenance' AFTER 'live';
