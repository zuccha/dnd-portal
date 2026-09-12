--------------------------------------------------------------------------------
-- REGISTRY SOURCE DEPENDENCIES
--------------------------------------------------------------------------------

DO $$
BEGIN
  CREATE TYPE public.source_dependency_relationship AS ENUM (
    'include',
    'require'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

ALTER TYPE public.source_dependency_relationship OWNER TO postgres;

CREATE TABLE public.registry_source_dependencies (
  source_id uuid NOT NULL
    REFERENCES public.registry_sources(source_id) ON DELETE CASCADE,
  dependency_source_id uuid NOT NULL
    REFERENCES public.registry_sources(source_id) ON DELETE RESTRICT,
  relationship public.source_dependency_relationship NOT NULL,
  CONSTRAINT registry_source_dependencies_pkey
    PRIMARY KEY (source_id, dependency_source_id, relationship)
);

ALTER TABLE public.registry_source_dependencies OWNER TO postgres;
ALTER TABLE public.registry_source_dependencies ENABLE ROW LEVEL SECURITY;

CREATE INDEX registry_source_dependencies_dependency_source_id_idx
  ON public.registry_source_dependencies (dependency_source_id);

GRANT SELECT ON TABLE public.registry_source_dependencies TO anon;
GRANT SELECT ON TABLE public.registry_source_dependencies TO authenticated;
GRANT ALL ON TABLE public.registry_source_dependencies TO service_role;

CREATE POLICY "Users can read registry source dependencies"
ON public.registry_source_dependencies
FOR SELECT TO authenticated
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
        'source_id', source.source_id
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
  ) dependencies ON true
  WHERE public.can_read_registry_source(source.source_id);
$$;

ALTER FUNCTION public.fetch_registry_sources() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.fetch_registry_sources()
  TO anon, authenticated, service_role;
