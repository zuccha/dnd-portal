--------------------------------------------------------------------------------
-- FETCH SOURCE METADATA
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_source_metadata(p_source_id uuid)
RETURNS TABLE(id uuid, code text, sync_version bigint, type public.source_type, version public.source_version, name jsonb)
LANGUAGE sql STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  WITH names AS (
    SELECT
      st.source_id AS id,
      jsonb_object_agg(st.lang, st.name) AS name
    FROM public.source_translations st
    GROUP BY st.source_id
  )
  SELECT
    s.id,
    s.code,
    s.sync_version,
    s.type,
    s.version,
    coalesce(n.name, '{}'::jsonb) AS name
  FROM public.source_ids_with_includes_and_requires(p_source_id) ids
  JOIN public.sources s ON s.id = ids.id
  LEFT JOIN names n ON n.id = s.id
  WHERE public.can_read_source(s.id)
  ORDER BY
    CASE WHEN s.id = p_source_id THEN 0 ELSE 1 END,
    s.code;
$$;

ALTER FUNCTION public.fetch_source_metadata(p_source_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_source_metadata(p_source_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_source_metadata(p_source_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_source_metadata(p_source_id uuid) TO service_role;
