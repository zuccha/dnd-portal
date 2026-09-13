--------------------------------------------------------------------------------
-- PUBLISH REGISTRY SOURCE
--------------------------------------------------------------------------------

DROP FUNCTION public.publish_registry_source_revision(uuid, uuid, text);

CREATE FUNCTION public.publish_registry_source_revision(
  p_source_id uuid,
  p_base_revision_id uuid,
  p_storage_path text,
  p_user_id uuid
)
RETURNS TABLE(
  revision_id uuid,
  revision_number bigint,
  revision_created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_source public.registry_sources%ROWTYPE;
  v_revision public.registry_revisions%ROWTYPE;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = p_source_id
      AND (
        source.creator_id = p_user_id
        OR EXISTS (
          SELECT 1
          FROM public.registry_source_access access
          WHERE access.source_id = source.source_id
            AND access.user_id = p_user_id
            AND access.access = 'write'
        )
      )
  ) THEN
    RAISE EXCEPTION 'User cannot publish this registry source'
      USING ERRCODE = '42501';
  END IF;

  IF p_storage_path IS NULL
     OR p_storage_path <> 'sources/' || p_source_id::text || '/bundle.json' THEN
    RAISE EXCEPTION 'Invalid registry bundle storage path'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_source
  FROM public.registry_sources
  WHERE source_id = p_source_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registry source not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_source.current_revision_id IS DISTINCT FROM p_base_revision_id THEN
    RAISE EXCEPTION 'Registry source has changed since the submitted revision'
      USING ERRCODE = '40001';
  END IF;

  INSERT INTO public.registry_revisions (
    source_id,
    revision_number,
    created_by,
    storage_path
  )
  VALUES (
    v_source.source_id,
    v_source.current_revision_number + 1,
    p_user_id,
    p_storage_path
  )
  RETURNING * INTO v_revision;

  UPDATE public.registry_sources
  SET current_revision_id = v_revision.id,
      current_revision_number = v_revision.revision_number
  WHERE source_id = v_source.source_id;

  RETURN QUERY
  SELECT v_revision.id,
         v_revision.revision_number,
         v_revision.revision_created_at;
END;
$$;

ALTER FUNCTION public.publish_registry_source_revision(uuid, uuid, text, uuid)
  OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.publish_registry_source_revision(uuid, uuid, text, uuid)
  TO service_role;


--------------------------------------------------------------------------------
-- REGISTRY BUNDLE STORAGE POLICIES
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can read registry bundles"
  ON storage.objects;

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
