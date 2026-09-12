--------------------------------------------------------------------------------
-- REGISTRY VISIBILITY AND ACCESS ENUMS
--------------------------------------------------------------------------------

CREATE TYPE public.registry_source_visibility AS ENUM ('public', 'private');
ALTER TYPE public.registry_source_visibility OWNER TO postgres;

CREATE TYPE public.registry_source_access_level AS ENUM ('read', 'write');
ALTER TYPE public.registry_source_access_level OWNER TO postgres;


--------------------------------------------------------------------------------
-- REGISTRY SOURCE VISIBILITY
--------------------------------------------------------------------------------

ALTER TABLE public.registry_sources
  ADD COLUMN visibility public.registry_source_visibility
    NOT NULL DEFAULT 'private';


--------------------------------------------------------------------------------
-- REGISTRY SOURCE ACCESS LEVEL
--------------------------------------------------------------------------------

ALTER TABLE public.registry_source_access
  DROP CONSTRAINT registry_source_access_access_check,
  ALTER COLUMN access TYPE public.registry_source_access_level
    USING access::text::public.registry_source_access_level;


--------------------------------------------------------------------------------
-- REGISTRY SOURCE READ ACCESS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_registry_source(p_source_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.registry_sources source
    WHERE source.source_id = p_source_id
      AND (
        source.visibility = 'public'
        OR source.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1
          FROM public.registry_source_access access
          WHERE access.source_id = source.source_id
            AND access.user_id = (SELECT auth.uid() AS uid)
            AND access.access IN ('read', 'write')
        )
      )
  );
$$;

ALTER FUNCTION public.can_read_registry_source(uuid) OWNER TO postgres;


--------------------------------------------------------------------------------
-- REGISTRY SOURCE POLICIES
--------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can read registry sources"
  ON public.registry_sources;
CREATE POLICY "Users can read registry sources"
ON public.registry_sources
FOR SELECT TO anon, authenticated
USING (public.can_read_registry_source(source_id));

DROP POLICY IF EXISTS "Users can read registry revisions"
  ON public.registry_revisions;
CREATE POLICY "Users can read registry revisions"
ON public.registry_revisions
FOR SELECT TO anon, authenticated
USING (public.can_read_registry_source(source_id));

DROP POLICY IF EXISTS "Users can read registry source dependencies"
  ON public.registry_source_dependencies;
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
            SELECT access.access::text
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
