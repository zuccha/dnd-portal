--------------------------------------------------------------------------------
-- CHARACTER SUBCLASS ROW
--------------------------------------------------------------------------------

CREATE TYPE public.character_subclass_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Character Subclass
  character_class_id uuid
);


--------------------------------------------------------------------------------
-- CREATE CHARACTER SUBCLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_character_subclass(
  p_source_id uuid,
  p_lang text,
  p_character_subclass jsonb,
  p_character_subclass_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.character_subclasses%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_subclasses, p_character_subclass);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_character_subclass || jsonb_build_object('kind', 'character_subclass'::public.resource_kind),
    p_character_subclass_translation
  );

  INSERT INTO public.character_subclasses (
    resource_id, character_class_id
  ) VALUES (
    v_id, r.character_class_id
  );

  perform public.upsert_character_subclass_translation(v_id, p_lang, p_character_subclass_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_character_subclass(p_source_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_character_subclass(p_source_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_character_subclass(p_source_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_character_subclass(p_source_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CHARACTER SUBCLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_character_subclass(p_id uuid)
RETURNS public.character_subclass_row
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
    s.character_class_id
  FROM public.fetch_resource(p_id) AS r
  JOIN public.character_subclasses s ON s.resource_id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_character_subclass(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_character_subclass(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_character_subclass(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_character_subclass(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CHARACTER SUBCLASSES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_character_subclasses(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.character_subclass_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'character_subclass'::public.resource_kind
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
    s.character_class_id
  FROM base b
  JOIN public.character_subclasses s ON s.resource_id = b.id
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
  s.page,
  s.character_class_id
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

ALTER FUNCTION public.fetch_character_subclasses(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_character_subclasses(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_character_subclasses(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_character_subclasses(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT CHARACTER SUBCLASS TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_character_subclass_translation(
  p_id uuid,
  p_lang text,
  p_character_subclass_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.character_subclass_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_subclass_translations, p_character_subclass_translation);

  INSERT INTO public.character_subclass_translations AS ct (
    resource_id, lang
  ) VALUES (
    p_id, p_lang
  )
  ON conflict (resource_id, lang) DO NOTHING;
END;
$$;

ALTER FUNCTION public.upsert_character_subclass_translation(p_id uuid, p_lang text, p_character_subclass_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_character_subclass_translation(p_id uuid, p_lang text, p_character_subclass_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_character_subclass_translation(p_id uuid, p_lang text, p_character_subclass_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_character_subclass_translation(p_id uuid, p_lang text, p_character_subclass_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE CHARACTER SUBCLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_character_subclass(
  p_id uuid,
  p_lang text,
  p_character_subclass jsonb,
  p_character_subclass_translation jsonb)
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
    p_character_subclass || jsonb_build_object('kind', 'character_subclass'::public.resource_kind),
    p_character_subclass_translation
  );

  UPDATE public.character_subclasses s
  SET (
    character_class_id
  ) = (
    SELECT r.character_class_id
    FROM jsonb_populate_record(null::public.character_subclasses, to_jsonb(s) || p_character_subclass) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_character_subclass_translation(p_id, p_lang, p_character_subclass_translation);
END;
$$;

ALTER FUNCTION public.update_character_subclass(p_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_character_subclass(p_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_character_subclass(p_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_character_subclass(p_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO service_role;
