ALTER TABLE public.sources
ADD COLUMN sync_version bigint DEFAULT 1 NOT NULL;

DROP FUNCTION public.fetch_sources(public.source_type[]);

CREATE OR REPLACE FUNCTION public.fetch_sources(p_types public.source_type[] DEFAULT NULL)
RETURNS TABLE(id uuid, code text, sync_version bigint, type public.source_type, version public.source_version, name jsonb, includes jsonb)
LANGUAGE sql STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  WITH names AS (
    SELECT
      st.source_id AS id,
      jsonb_object_agg(st.lang, st.name) AS name
    FROM public.source_translations st
    GROUP BY st.source_id
  ),
  visible AS (
    SELECT
      s.id,
      s.code,
      s.sync_version,
      s.type,
      s.version,
      coalesce(n.name, '{}'::jsonb) AS name
    FROM public.sources s
    LEFT JOIN names n ON n.id = s.id
    WHERE public.can_read_source(s.id)
      AND (p_types IS NULL OR s.type = ANY(p_types))
  )
  SELECT
    v.id,
    v.code,
    v.sync_version,
    v.type,
    v.version,
    v.name,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', d.id,
          'code', ds.code,
          'sync_version', ds.sync_version,
          'type', ds.type,
          'version', ds.version,
          'name', coalesce(dn.name, '{}'::jsonb)
        )
        ORDER BY ds.code
      ) FILTER (WHERE d.id IS NOT NULL),
      '[]'::jsonb
    ) AS includes
  FROM visible v
  LEFT JOIN LATERAL (
    WITH RECURSIVE tree AS (
      SELECT si.include_id AS id, ARRAY[si.include_id] AS path
      FROM public.source_includes si
      WHERE si.source_id = v.id
      UNION ALL
      SELECT sr.required_id, t.path || sr.required_id
      FROM public.source_requires sr
      JOIN tree t ON sr.source_id = t.id
      WHERE NOT sr.required_id = ANY(t.path)
    )
    SELECT DISTINCT t.id
    FROM tree t
    WHERE public.can_read_source(t.id)
  ) d ON true
  LEFT JOIN public.sources ds ON ds.id = d.id
  LEFT JOIN names dn ON dn.id = d.id
  GROUP BY v.id, v.code, v.sync_version, v.type, v.version, v.name
  ORDER BY v.code;
$$;

ALTER FUNCTION public.fetch_sources(p_types public.source_type[]) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_sources(p_types public.source_type[]) TO anon;
GRANT ALL ON FUNCTION public.fetch_sources(p_types public.source_type[]) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_sources(p_types public.source_type[]) TO service_role;
