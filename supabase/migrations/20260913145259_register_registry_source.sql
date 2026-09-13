--------------------------------------------------------------------------------
-- REGISTER REGISTRY SOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.register_registry_source(
  p_source_id uuid,
  p_code text,
  p_name jsonb,
  p_type public.source_type,
  p_version public.source_version,
  p_include_ids uuid[],
  p_require_ids uuid[],
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
  v_revision public.registry_revisions%ROWTYPE;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.registry_publishers publisher
    WHERE publisher.user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'User is not authorized to register registry sources'
      USING ERRCODE = '42501';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = p_source_id
  ) THEN
    RAISE EXCEPTION 'Registry source already exists'
      USING ERRCODE = '23505';
  END IF;

  IF p_storage_path IS NULL
     OR p_storage_path <> 'sources/' || p_source_id::text || '/bundle.json' THEN
    RAISE EXCEPTION 'Invalid registry bundle storage path'
      USING ERRCODE = '22023';
  END IF;

  IF p_bundle_hash IS NULL OR p_bundle_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid registry bundle hash'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.registry_sources (
    source_id,
    creator_id,
    code,
    name,
    type,
    version
  )
  VALUES (
    p_source_id,
    p_user_id,
    p_code,
    p_name,
    p_type,
    p_version
  );

  INSERT INTO public.registry_source_dependencies (
    source_id,
    dependency_source_id,
    relationship
  )
  SELECT p_source_id, dependency_id, 'include'
  FROM unnest(coalesce(p_include_ids, ARRAY[]::uuid[])) dependency_id
  WHERE EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = dependency_id
  );

  INSERT INTO public.registry_source_dependencies (
    source_id,
    dependency_source_id,
    relationship
  )
  SELECT p_source_id, dependency_id, 'require'
  FROM unnest(coalesce(p_require_ids, ARRAY[]::uuid[])) dependency_id
  WHERE EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = dependency_id
  );

  INSERT INTO public.registry_revisions (
    source_id,
    revision_number,
    created_by,
    storage_path,
    bundle_hash
  )
  VALUES (
    p_source_id,
    1,
    p_user_id,
    p_storage_path,
    p_bundle_hash
  )
  RETURNING * INTO v_revision;

  UPDATE public.registry_sources
  SET current_revision_id = v_revision.id,
      current_revision_number = v_revision.revision_number
  WHERE source_id = p_source_id;

  RETURN QUERY
  SELECT v_revision.id,
         v_revision.revision_number,
         v_revision.revision_created_at;
END;
$$;

ALTER FUNCTION public.register_registry_source(
  uuid,
  text,
  jsonb,
  public.source_type,
  public.source_version,
  uuid[],
  uuid[],
  text,
  uuid,
  text
) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.register_registry_source(
  uuid,
  text,
  jsonb,
  public.source_type,
  public.source_version,
  uuid[],
  uuid[],
  text,
  uuid,
  text
) TO service_role;
