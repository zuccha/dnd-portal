--------------------------------------------------------------------------------
-- REGISTRY PUBLISHERS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.registry_publishers (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT registry_publishers_pkey PRIMARY KEY (user_id)
);

ALTER TABLE public.registry_publishers OWNER TO postgres;
ALTER TABLE public.registry_publishers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.registry_publishers TO service_role;
GRANT SELECT ON TABLE public.registry_publishers TO authenticated;


--------------------------------------------------------------------------------
-- REGISTRY SOURCE CREATION POLICY
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Creators can create registry sources"
  ON public.registry_sources;

CREATE POLICY "Creators can create registry sources"
ON public.registry_sources
FOR INSERT TO authenticated
WITH CHECK (
  creator_id = (SELECT auth.uid() AS uid)
  AND EXISTS (
    SELECT 1
    FROM public.registry_publishers publisher
    WHERE publisher.user_id = (SELECT auth.uid() AS uid)
  )
);


--------------------------------------------------------------------------------
-- REGISTRY REVISION PUBLISHING AUTHORIZATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.publish_registry_source_revision(
  p_source_id uuid,
  p_base_revision_id uuid,
  p_storage_path text,
  p_user_id uuid,
  p_bundle_hash text
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
    FROM public.registry_publishers publisher
    WHERE publisher.user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'User is not authorized to publish registry sources'
      USING ERRCODE = '42501';
  END IF;

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
     OR p_storage_path NOT LIKE 'sources/' || p_source_id::text || '/%' THEN
    RAISE EXCEPTION 'Invalid registry bundle storage path'
      USING ERRCODE = '22023';
  END IF;

  IF p_bundle_hash IS NULL OR p_bundle_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid registry bundle hash'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_source
  FROM public.registry_sources
  WHERE source_id = p_source_id
  FOR UPDATE NOWAIT;

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
    storage_path,
    bundle_hash
  )
  VALUES (
    v_source.source_id,
    v_source.current_revision_number + 1,
    p_user_id,
    p_storage_path,
    p_bundle_hash
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

ALTER FUNCTION public.publish_registry_source_revision(
  uuid,
  uuid,
  text,
  uuid,
  text
) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.publish_registry_source_revision(
  uuid,
  uuid,
  text,
  uuid,
  text
) TO service_role;
