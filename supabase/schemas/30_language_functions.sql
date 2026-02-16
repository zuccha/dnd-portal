--------------------------------------------------------------------------------
-- LANGUAGE ROW
--------------------------------------------------------------------------------

CREATE TYPE public.language_row AS (
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
  -- Language
  rarity public.language_rarity,
  -- Language Translation
  origin jsonb
);


--------------------------------------------------------------------------------
-- CREATE LANGUAGE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_language(
  p_source_id uuid,
  p_lang text,
  p_language jsonb,
  p_language_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.languages%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.languages, p_language);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_language || jsonb_build_object('kind', 'language'::public.resource_kind),
    p_language_translation
  );

  INSERT INTO public.languages (
    resource_id, rarity
  ) VALUES (
    v_id, r.rarity
  );

  perform public.upsert_language_translation(v_id, p_lang, p_language_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_language(p_source_id uuid, p_lang text, p_language jsonb, p_language_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_language(p_source_id uuid, p_lang text, p_language jsonb, p_language_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_language(p_source_id uuid, p_lang text, p_language jsonb, p_language_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_language(p_source_id uuid, p_lang text, p_language jsonb, p_language_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH LANGUAGE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_language(p_id uuid)
RETURNS public.language_row
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
    l.rarity,
    coalesce(tt.origin, '{}'::jsonb) AS origin
  FROM public.fetch_resource(p_id) AS r
  JOIN public.languages l ON l.resource_id = r.id
  LEFT JOIN (
    SELECT
      l.resource_id AS id,
      jsonb_object_agg(t.lang, t.origin) AS origin
    FROM public.languages l
    LEFT JOIN public.language_translations t ON t.resource_id = l.resource_id
    WHERE l.resource_id = p_id
    GROUP BY l.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_language(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_language(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_language(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_language(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH LANGUAGES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_languages(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.language_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'language'::public.resource_kind
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
    l.rarity
  FROM base b
  JOIN public.languages l ON l.resource_id = b.id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.origin) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS origin
  FROM src s
  LEFT JOIN public.language_translations t ON t.resource_id = s.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY s.id
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
  s.rarity,
  coalesce(tt.origin, '{}'::jsonb) AS origin
FROM src s
LEFT JOIN t tt ON tt.id = s.id
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

ALTER FUNCTION public.fetch_languages(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_languages(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_languages(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_languages(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT LANGUAGE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_language_translation(
  p_id uuid,
  p_lang text,
  p_language_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.language_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.language_translations, p_language_translation);

  INSERT INTO public.language_translations AS lt (
    resource_id, lang, origin
  ) VALUES (
    p_id, p_lang, r.origin
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    origin = excluded.origin;
END;
$$;

ALTER FUNCTION public.upsert_language_translation(p_id uuid, p_lang text, p_language_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_language_translation(p_id uuid, p_lang text, p_language_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_language_translation(p_id uuid, p_lang text, p_language_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_language_translation(p_id uuid, p_lang text, p_language_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE LANGUAGE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_language(
  p_id uuid,
  p_lang text,
  p_language jsonb,
  p_language_translation jsonb)
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
    p_language || jsonb_build_object('kind', 'language'::public.resource_kind),
    p_language_translation
  );

  UPDATE public.languages l
  SET (
    rarity
  ) = (
    SELECT r.rarity
    FROM jsonb_populate_record(null::public.languages, to_jsonb(l) || p_language) AS r
  )
  WHERE l.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_language_translation(p_id, p_lang, p_language_translation);
END;
$$;

ALTER FUNCTION public.update_language(p_id uuid, p_lang text, p_language jsonb, p_language_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_language(p_id uuid, p_lang text, p_language jsonb, p_language_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_language(p_id uuid, p_lang text, p_language jsonb, p_language_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_language(p_id uuid, p_lang text, p_language jsonb, p_language_translation jsonb) TO service_role;
