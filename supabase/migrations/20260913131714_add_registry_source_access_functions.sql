--------------------------------------------------------------------------------
-- REGISTRY SOURCE ACCESS FUNCTIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_registry_source_access(
  p_source_id uuid
)
RETURNS TABLE(
  user_id uuid,
  email text,
  access public.registry_source_access_level,
  granted_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'pg_temp'
AS $$
  SELECT access.user_id,
         users.email,
         access.access,
         access.granted_at
  FROM public.registry_source_access access
  JOIN auth.users users ON users.id = access.user_id
  JOIN public.registry_sources source ON source.source_id = access.source_id
  WHERE access.source_id = p_source_id
    AND source.creator_id = (SELECT auth.uid() AS uid);
$$;

ALTER FUNCTION public.fetch_registry_source_access(uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.fetch_registry_source_access(uuid)
  TO authenticated;


--------------------------------------------------------------------------------
-- GRANT REGISTRY SOURCE ACCESS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.grant_registry_source_access(
  p_source_id uuid,
  p_email text,
  p_access public.registry_source_access_level
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'pg_temp'
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = p_source_id
      AND source.creator_id = (SELECT auth.uid() AS uid)
  ) THEN
    RAISE EXCEPTION 'Only the registry source creator can manage access'
      USING ERRCODE = '42501';
  END IF;

  SELECT users.id
  INTO v_user_id
  FROM auth.users users
  WHERE lower(users.email) = lower(trim(p_email));

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User email was not found'
      USING ERRCODE = '22023';
  END IF;

  IF v_user_id = (
    SELECT creator_id
    FROM public.registry_sources
    WHERE source_id = p_source_id
  ) THEN
    RAISE EXCEPTION 'The source creator already has full access'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.registry_source_access (source_id, user_id, access)
  VALUES (p_source_id, v_user_id, p_access)
  ON CONFLICT (source_id, user_id)
  DO UPDATE SET access = EXCLUDED.access;
END;
$$;

ALTER FUNCTION public.grant_registry_source_access(
  uuid,
  text,
  public.registry_source_access_level
) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.grant_registry_source_access(
  uuid,
  text,
  public.registry_source_access_level
) TO authenticated;


--------------------------------------------------------------------------------
-- REVOKE REGISTRY SOURCE ACCESS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.revoke_registry_source_access(
  p_source_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = p_source_id
      AND source.creator_id = (SELECT auth.uid() AS uid)
  ) THEN
    RAISE EXCEPTION 'Only the registry source creator can manage access'
      USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.registry_source_access
  WHERE source_id = p_source_id
    AND user_id = p_user_id;
END;
$$;

ALTER FUNCTION public.revoke_registry_source_access(uuid, uuid)
  OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.revoke_registry_source_access(uuid, uuid)
  TO authenticated;


--------------------------------------------------------------------------------
-- REGISTRY SOURCE ACCESS RESPONSE
--------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.fetch_registry_sources();

CREATE OR REPLACE FUNCTION public.fetch_registry_sources()
RETURNS SETOF jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_strip_nulls(
    jsonb_build_object(
      'code', source.code,
      'id', source.source_id,
      'includes', dependencies.includes,
      'name', source.name,
      'registry', jsonb_build_object(
        'access', CASE
          WHEN source.creator_id = (SELECT auth.uid() AS uid) THEN 'creator'
          ELSE (
            SELECT access.access::text
            FROM public.registry_source_access access
            WHERE access.source_id = source.source_id
              AND access.user_id = (SELECT auth.uid() AS uid)
          )
        END,
        'bundle_hash', revision.bundle_hash,
        'revision_created_at', coalesce(
          revision.revision_created_at,
          source.created_at
        ),
        'revision_id', coalesce(revision.id, source.source_id),
        'revision_number', source.current_revision_number,
        'source_id', source.source_id,
        'visibility', source.visibility
      ),
      'requires', dependencies.requires,
      'type', source.type,
      'version', source.version
    )
  )
  FROM public.registry_sources source
  LEFT JOIN public.registry_revisions revision
    ON revision.id = source.current_revision_id
  LEFT JOIN LATERAL (
    SELECT
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'code', dependency.code,
            'name', dependency.name,
            'source_id', dependency.source_id,
            'version', dependency.version
          )
        ) FILTER (WHERE relation.relationship = 'include'),
        '[]'::jsonb
      ) AS includes,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'code', dependency.code,
            'name', dependency.name,
            'source_id', dependency.source_id,
            'version', dependency.version
          )
        ) FILTER (WHERE relation.relationship = 'require'),
        '[]'::jsonb
      ) AS requires
    FROM public.registry_source_dependencies relation
    JOIN public.registry_sources dependency
      ON dependency.source_id = relation.dependency_source_id
    WHERE relation.source_id = source.source_id
      AND public.can_read_registry_source(dependency.source_id)
  ) dependencies ON true
  WHERE public.can_read_registry_source(source.source_id);
$$;

ALTER FUNCTION public.fetch_registry_sources() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.fetch_registry_sources()
  TO anon, authenticated, service_role;
