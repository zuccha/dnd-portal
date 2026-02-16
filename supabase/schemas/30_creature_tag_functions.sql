--------------------------------------------------------------------------------
-- CREATURE TAG ROW
--------------------------------------------------------------------------------

CREATE TYPE public.creature_tag_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb
);


--------------------------------------------------------------------------------
-- CREATE CREATURE TAG
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_creature_tag(
  p_source_id uuid,
  p_lang text,
  p_creature_tag jsonb,
  p_creature_tag_translation jsonb)
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
    p_creature_tag || jsonb_build_object('kind', 'creature_tag'::public.resource_kind),
    p_creature_tag_translation
  );

  INSERT INTO public.creature_tags (resource_id)
  VALUES (v_id);

  perform public.upsert_creature_tag_translation(v_id, p_lang, p_creature_tag_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_creature_tag(p_source_id uuid, p_lang text, p_creature_tag jsonb, p_creature_tag_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_creature_tag(p_source_id uuid, p_lang text, p_creature_tag jsonb, p_creature_tag_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_creature_tag(p_source_id uuid, p_lang text, p_creature_tag jsonb, p_creature_tag_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_creature_tag(p_source_id uuid, p_lang text, p_creature_tag jsonb, p_creature_tag_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CREATURE TAG
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_creature_tag(p_id uuid)
RETURNS public.creature_tag_row
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
    r.page
  FROM public.fetch_resource(p_id) AS r
  JOIN public.creature_tags ct ON ct.resource_id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_creature_tag(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_creature_tag(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_creature_tag(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_creature_tag(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CREATURE TAGS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_creature_tags(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.creature_tag_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'creature_tag'::public.resource_kind
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
    b.page
  FROM base b
  JOIN public.creature_tags ct ON ct.resource_id = b.id
)
SELECT
  s.source_id,
  s.source_code,
  s.id,
  s.kind,
  s.visibility,
  s.image_url,
  s.name,
  s.name_short,
  s.page
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

ALTER FUNCTION public.fetch_creature_tags(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_creature_tags(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_creature_tags(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_creature_tags(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT CREATURE TAG TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_creature_tag_translation(
  p_id uuid,
  p_lang text,
  p_creature_tag_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.creature_tag_translations AS ctt (resource_id, lang)
  VALUES (p_id, p_lang)
  ON conflict (resource_id, lang) DO NOTHING;

  perform public.upsert_resource_translation(p_id, p_lang, p_creature_tag_translation);
END;
$$;

ALTER FUNCTION public.upsert_creature_tag_translation(p_id uuid, p_lang text, p_creature_tag_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_creature_tag_translation(p_id uuid, p_lang text, p_creature_tag_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_creature_tag_translation(p_id uuid, p_lang text, p_creature_tag_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_creature_tag_translation(p_id uuid, p_lang text, p_creature_tag_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE CREATURE TAG
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_creature_tag(
  p_id uuid,
  p_lang text,
  p_creature_tag jsonb,
  p_creature_tag_translation jsonb)
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
    p_creature_tag || jsonb_build_object('kind', 'creature_tag'::public.resource_kind),
    p_creature_tag_translation
  );

  UPDATE public.creature_tags ct
  SET resource_id = ct.resource_id
  WHERE ct.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_creature_tag_translation(p_id, p_lang, p_creature_tag_translation);
END;
$$;

ALTER FUNCTION public.update_creature_tag(p_id uuid, p_lang text, p_creature_tag jsonb, p_creature_tag_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_creature_tag(p_id uuid, p_lang text, p_creature_tag jsonb, p_creature_tag_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_creature_tag(p_id uuid, p_lang text, p_creature_tag jsonb, p_creature_tag_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_creature_tag(p_id uuid, p_lang text, p_creature_tag jsonb, p_creature_tag_translation jsonb) TO service_role;
