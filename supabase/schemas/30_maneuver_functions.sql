--------------------------------------------------------------------------------
-- MANEUVER ROW
--------------------------------------------------------------------------------

CREATE TYPE public.maneuver_row AS (
  -- Resource
  id uuid,
  source_id uuid,
  source_code text,
  source_version public.source_version,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  -- Resource Translation
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Maneuver Translation
  description jsonb,
  prerequisite jsonb
);


--------------------------------------------------------------------------------
-- CREATE MANEUVER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_maneuver(
  p_source_id uuid,
  p_lang text,
  p_maneuver jsonb,
  p_maneuver_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
BEGIN
  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_maneuver || jsonb_build_object('kind', 'maneuver'::public.resource_kind),
    p_maneuver_translation
  );

  INSERT INTO public.maneuvers (
    resource_id
  ) VALUES (
    v_id
  );

  perform public.upsert_maneuver_translation(v_id, p_lang, p_maneuver_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_maneuver(p_source_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_maneuver(p_source_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_maneuver(p_source_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_maneuver(p_source_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH MANEUVER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_maneuver(p_id uuid)
RETURNS public.maneuver_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.id,
    r.source_id,
    r.source_code,
    r.source_version,
    r.kind,
    r.visibility,
    r.image_url,
    r.name,
    r.name_short,
    r.page,
    coalesce(tt.description, '{}'::jsonb)  AS description,
    coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite
  FROM public.fetch_resource(p_id) AS r
  JOIN public.maneuvers m ON m.resource_id = r.id
  LEFT JOIN (
    SELECT
      m.resource_id AS id,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description)  AS description
    FROM public.maneuvers m
    LEFT JOIN public.maneuver_translations t ON t.resource_id = m.resource_id
    WHERE m.resource_id = p_id
    GROUP BY m.resource_id
  ) tt ON tt.id = r.id;
$$;

ALTER FUNCTION public.fetch_maneuver(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_maneuver(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_maneuver(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_maneuver(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH MANEUVERS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_maneuvers(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.maneuver_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'maneuver'::public.resource_kind
),
mt AS (
  SELECT
    b.id,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM base b
  LEFT JOIN public.maneuver_translations t ON t.resource_id = b.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY b.id
)
SELECT
  b.id,
  b.source_id,
  b.source_code,
  b.source_version,
  b.kind,
  b.visibility,
  b.image_url,
  b.name,
  b.name_short,
  b.page,
  coalesce(mt.description, '{}'::jsonb)  AS description,
  coalesce(mt.prerequisite, '{}'::jsonb) AS prerequisite
FROM base b
LEFT JOIN mt ON mt.id = b.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (b.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (b.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_maneuvers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_maneuvers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_maneuvers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_maneuvers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT MANEUVER TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_maneuver_translation(
  p_id uuid,
  p_lang text,
  p_maneuver_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.maneuver_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.maneuver_translations, p_maneuver_translation);

  INSERT INTO public.maneuver_translations AS st (
    resource_id, lang, prerequisite, description
  ) VALUES (
    p_id, p_lang, r.prerequisite, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    prerequisite = excluded.prerequisite,
    description = excluded.description;
END;
$$;

ALTER FUNCTION public.upsert_maneuver_translation(p_id uuid, p_lang text, p_maneuver_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_maneuver_translation(p_id uuid, p_lang text, p_maneuver_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_maneuver_translation(p_id uuid, p_lang text, p_maneuver_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_maneuver_translation(p_id uuid, p_lang text, p_maneuver_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE MANEUVER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_maneuver(
  p_id uuid,
  p_lang text,
  p_maneuver jsonb,
  p_maneuver_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows int;
BEGIN
  perform public.update_resource(
    p_id,
    p_lang,
    p_maneuver || jsonb_build_object('kind', 'maneuver'::public.resource_kind),
    p_maneuver_translation
  );

  UPDATE public.maneuvers m
  SET resource_id = m.resource_id
  WHERE m.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_maneuver_translation(p_id, p_lang, p_maneuver_translation);
END;
$$;

ALTER FUNCTION public.update_maneuver(p_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_maneuver(p_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_maneuver(p_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_maneuver(p_id uuid, p_lang text, p_maneuver jsonb, p_maneuver_translation jsonb) TO service_role;
