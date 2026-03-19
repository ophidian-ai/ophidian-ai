-- Delta migration to align SEO schema with updated spec

-- Rename columns for spec alignment
ALTER TABLE seo_configs RENAME COLUMN url TO website_url;
ALTER TABLE seo_configs RENAME COLUMN target_keywords TO keywords;

-- Add overall_score and scores jsonb to seo_audits
ALTER TABLE seo_audits ADD COLUMN IF NOT EXISTS overall_score int NOT NULL DEFAULT 0;
ALTER TABLE seo_audits ADD COLUMN IF NOT EXISTS scores jsonb NOT NULL DEFAULT '{}';

-- Add updated_at to seo_gbp_drafts
ALTER TABLE seo_gbp_drafts ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Add 'posted' to gbp_draft_status enum
ALTER TYPE gbp_draft_status ADD VALUE IF NOT EXISTS 'posted';

-- Add service_type enum values for new products
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'seo_automation';
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'content_generation';

-- Add updated_at trigger for seo_gbp_drafts (reuse existing trigger function)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'seo_gbp_drafts_updated_at') THEN
    CREATE TRIGGER seo_gbp_drafts_updated_at
      BEFORE UPDATE ON seo_gbp_drafts
      FOR EACH ROW
      EXECUTE FUNCTION update_chatbot_updated_at();
  END IF;
END
$$;
