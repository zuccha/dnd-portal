--------------------------------------------------------------------------------
-- REGISTRY BUNDLE STORAGE POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read registry bundles"
ON storage.objects
FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'registry-bundles'
  AND name ~ '^sources/[0-9a-fA-F-]{36}/bundle[.]json$'
  AND public.can_read_registry_source(
    CASE
      WHEN name ~ '^sources/[0-9a-fA-F-]{36}/bundle[.]json$'
      THEN split_part(name, '/', 2)::uuid
    END
  )
);
