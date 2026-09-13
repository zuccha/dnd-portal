--------------------------------------------------------------------------------
-- CAN READ REGISTRY SOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_registry_source(
  p_source_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.registry_sources rs
    WHERE rs.source_id = p_source_id
      AND (
        rs.visibility = 'public'
        OR rs.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1
          FROM public.registry_source_access rsa
          WHERE rsa.source_id = rs.source_id
            AND rsa.user_id = (SELECT auth.uid() AS uid)
            AND rsa.access IN ('read', 'write')
        )
      )
  );
$$;

ALTER FUNCTION public.can_read_registry_source(uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.can_read_registry_source(uuid)
  TO anon, authenticated, service_role;


--------------------------------------------------------------------------------
-- CAN WRITE REGISTRY SOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_write_registry_source(
  p_source_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.registry_sources rs
    WHERE rs.source_id = p_source_id
      AND (
        rs.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1
          FROM public.registry_source_access rsa
          WHERE rsa.source_id = rs.source_id
            AND rsa.user_id = (SELECT auth.uid() AS uid)
            AND rsa.access = 'write'
        )
      )
  );
$$;

ALTER FUNCTION public.can_write_registry_source(uuid) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.can_write_registry_source(uuid)
  TO authenticated, service_role;


--------------------------------------------------------------------------------
-- PUBLISH REGISTRY SOURCE REVISION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.publish_registry_source_revision(
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
     OR p_storage_path NOT LIKE 'sources/' || p_source_id::text || '/%' THEN
    RAISE EXCEPTION 'Invalid registry bundle storage path'
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
-- REGISTRY SOURCE POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read registry sources"
ON public.registry_sources
FOR SELECT TO anon, authenticated
USING (public.can_read_registry_source(source_id));

CREATE POLICY "Creators can create registry sources"
ON public.registry_sources
FOR INSERT TO authenticated
WITH CHECK (creator_id = (SELECT auth.uid() AS uid));

CREATE POLICY "Users can read registry revisions"
ON public.registry_revisions
FOR SELECT TO anon, authenticated
USING (public.can_read_registry_source(source_id));

CREATE POLICY "Users can read registry source access"
ON public.registry_source_access
FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid() AS uid)
  OR EXISTS (
    SELECT 1
    FROM public.registry_sources rs
    WHERE rs.source_id = registry_source_access.source_id
      AND rs.creator_id = (SELECT auth.uid() AS uid)
  )
);

CREATE POLICY "Creators can manage registry source access"
ON public.registry_source_access
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.registry_sources rs
    WHERE rs.source_id = registry_source_access.source_id
      AND rs.creator_id = (SELECT auth.uid() AS uid)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.registry_sources rs
    WHERE rs.source_id = registry_source_access.source_id
      AND rs.creator_id = (SELECT auth.uid() AS uid)
  )
);

CREATE POLICY "Users can read registry source dependencies"
ON public.registry_source_dependencies
FOR SELECT TO anon, authenticated
USING (public.can_read_registry_source(source_id));

--------------------------------------------------------------------------------
-- FETCH REGISTRY SOURCES
--------------------------------------------------------------------------------

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
          WHEN source.creator_id = (SELECT auth.uid() AS uid) THEN 'write'
          ELSE (
            SELECT access.access
            FROM public.registry_source_access access
            WHERE access.source_id = source.source_id
              AND access.user_id = (SELECT auth.uid() AS uid)
          )
        END,
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
