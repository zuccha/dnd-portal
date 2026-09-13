--------------------------------------------------------------------------------
-- REGISTRY BUNDLE STORAGE POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read registry bundles"
ON storage.objects
FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'registry-bundles'
  AND name ~ '^sources/[0-9a-fA-F-]{36}/'
  AND public.can_read_registry_source(
    CASE
      WHEN name ~ '^sources/[0-9a-fA-F-]{36}/'
      THEN split_part(name, '/', 2)::uuid
    END
  )
);
