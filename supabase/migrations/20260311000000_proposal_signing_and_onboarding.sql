-- Part 1: Add revision_requested to proposal_status enum
-- Must be in its own transaction (PostgreSQL restriction: can't use new enum value in same txn)
ALTER TYPE proposal_status ADD VALUE IF NOT EXISTS 'revision_requested';
