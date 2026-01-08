--------------------------------------------------------------------------------
-- PLANE ROW
--------------------------------------------------------------------------------

CREATE TYPE public.plane_row AS (
  -- Resource
  campaign_id uuid,
  campaign_name text,
  id uuid,
  kind public.resource_kind,
  visibility public.campaign_role,
  name jsonb,
  page jsonb,
  -- Plane
  category public.plane_category,
  alignments public.creature_alignment[]
);


--------------------------------------------------------------------------------
-- CREATE PLANE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_plane(
  p_campaign_id uuid,
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
    p_campaign_id,
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

ALTER FUNCTION public.create_plane(p_campaign_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_plane(p_campaign_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_plane(p_campaign_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_plane(p_campaign_id uuid, p_lang text, p_plane jsonb, p_plane_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH PLANE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_plane(p_id uuid)
RETURNS public.plane_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.campaign_id,
    r.campaign_name,
    r.id,
    r.kind,
    r.visibility,
    r.name,
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
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.plane_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'plane'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.campaign_id,
    b.campaign_name,
    b.kind,
    b.visibility,
    b.name,
    b.page,
    p.category,
    p.alignments
  FROM base b
  JOIN public.planes p ON p.resource_id = b.id
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.page,
  s.category,
  s.alignments
FROM src s
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_planes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_planes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_planes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_planes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


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
