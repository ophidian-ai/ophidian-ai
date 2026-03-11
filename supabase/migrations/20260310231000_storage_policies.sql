-- Create site_content table for inline editing (EditableText / EditableImage)
CREATE TABLE IF NOT EXISTS site_content (
  page text NOT NULL,
  key text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  PRIMARY KEY (page, key)
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Site content policies (wrapped to avoid duplicates)
DO $$ BEGIN
  CREATE POLICY "Public read site_content"
    ON site_content FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin write site_content"
    ON site_content FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Storage policies for site-content bucket
UPDATE storage.buckets SET public = true WHERE id = 'site-content';

DO $$ BEGIN
  CREATE POLICY "Public read access on site-content"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'site-content');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin upload on site-content"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'site-content'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin update on site-content"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'site-content'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin delete on site-content"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'site-content'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
