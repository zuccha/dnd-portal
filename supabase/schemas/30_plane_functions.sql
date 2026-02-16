--------------------------------------------------------------------------------
-- PLANE ROW
--------------------------------------------------------------------------------

CREATE TYPE public.plane_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  id uuid,
  kind public.resource_kind,
  visibility public.campaign_role,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Plane
  category public.plane_category,
  alignments public.creature_alignment[]
);


--------------------------------------------------------------------------------
-- CREATE PLANE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_plane(
  p_source_id uuid,
  p_lang text,
  p_plane jsonb,
  p_plane_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.planes%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.planes, p_plane);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_plane || jsonb_build_object('kind', 'plane'::public.resource_kind),
    p_plane_translation
  );

  INSERT INTO public.planes (
    resource_id, category, alignments
  ) VALUES (
    v_id, r.category, r.alignments
  );

  perform public.upsert_plane_translation(v_id, p_lang, p_plane_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_plane(p_source_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_plane(p_source_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_plane(p_source_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_plane(p_source_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH PLANE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_plane(p_id uuid)
RETURNS public.plane_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.source_id,
    r.source_code,
    r.id,
    r.kind,
    r.visibility,
    r.image_url,
    r.name,
    r.name_short,
    r.page,
    p.category,
    p.alignments
  FROM public.fetch_resource(p_id) AS r
  JOIN public.planes p ON p.resource_id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_plane(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_plane(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_plane(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_plane(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH PLANES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_planes(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.plane_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    (
      SELECT coalesce(array_agg(lower(e.key)::public.plane_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'true'
    ) AS categories_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.plane_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'false'
    ) AS categories_exc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_alignment), null)
      FROM jsonb_each_text(p_filters->'alignments') AS e(key, value)
      WHERE e.value = 'true'
    ) AS alignments_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_alignment), null)
      FROM jsonb_each_text(p_filters->'alignments') AS e(key, value)
      WHERE e.value = 'false'
    ) AS alignments_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'plane'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.source_id,
    b.source_code,
    b.kind,
    b.visibility,
    b.image_url,
    b.name,
    b.name_short,
    b.page,
    p.category,
    p.alignments
  FROM base b
  JOIN public.planes p ON p.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    (p.categories_inc IS NULL OR s.category = any(p.categories_inc))
    AND (p.categories_exc IS NULL OR NOT (s.category = any(p.categories_exc)))
    AND (p.alignments_inc IS NULL OR s.alignments && p.alignments_inc)
    AND (p.alignments_exc IS NULL OR NOT (s.alignments && p.alignments_exc))
)
SELECT
  f.source_id,
  f.source_code,
  f.id,
  f.kind,
  f.visibility,
  f.image_url,
  f.name,
  f.name_short,
  f.page,
  f.category,
  f.alignments
FROM filtered f
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (f.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (f.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_planes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_planes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_planes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_planes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT PLANE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_plane_translation(
  p_id uuid,
  p_lang text,
  p_plane_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.plane_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.plane_translations, p_plane_translation);

  INSERT INTO public.plane_translations AS pt (
    resource_id, lang
  ) VALUES (
    p_id, p_lang
  )
  ON conflict (resource_id, lang) DO NOTHING;
END;
$$;

ALTER FUNCTION public.upsert_plane_translation(p_id uuid, p_lang text, p_plane_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_plane_translation(p_id uuid, p_lang text, p_plane_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_plane_translation(p_id uuid, p_lang text, p_plane_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_plane_translation(p_id uuid, p_lang text, p_plane_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE PLANE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_plane(
  p_id uuid,
  p_lang text,
  p_plane jsonb,
  p_plane_translation jsonb)
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
    p_plane || jsonb_build_object('kind', 'plane'::public.resource_kind),
    p_plane_translation
  );

  UPDATE public.planes p
  SET (
    category,
    alignments
  ) = (
    SELECT r.category, r.alignments
    FROM jsonb_populate_record(null::public.planes, to_jsonb(p) || p_plane) AS r
  )
  WHERE p.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_plane_translation(p_id, p_lang, p_plane_translation);
END;
$$;

ALTER FUNCTION public.update_plane(p_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_plane(p_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_plane(p_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_plane(p_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) TO service_role;
