--------------------------------------------------------------------------------
-- METAMAGIC ROW
--------------------------------------------------------------------------------

CREATE TYPE public.metamagic_row AS (
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
  -- Metamagic
  sorcery_points smallint,
  -- Metamagic Translation
  description jsonb,
  prerequisite jsonb
);


--------------------------------------------------------------------------------
-- CREATE METAMAGIC
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_metamagic(
  p_source_id uuid,
  p_lang text,
  p_metamagic jsonb,
  p_metamagic_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  m public.metamagics%ROWTYPE;
BEGIN
  m := jsonb_populate_record(null::public.metamagics, p_metamagic);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_metamagic || jsonb_build_object('kind', 'metamagic'::public.resource_kind),
    p_metamagic_translation
  );

  INSERT INTO public.metamagics (
    resource_id, sorcery_points
  ) VALUES (
    v_id, m.sorcery_points
  );

  perform public.upsert_metamagic_translation(v_id, p_lang, p_metamagic_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_metamagic(p_source_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_metamagic(p_source_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_metamagic(p_source_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_metamagic(p_source_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH METAMAGIC
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_metamagic(p_id uuid)
RETURNS public.metamagic_row
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
    m.sorcery_points,
    coalesce(tt.description, '{}'::jsonb)  AS description,
    coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite
  FROM public.fetch_resource(p_id) AS r
  JOIN public.metamagics m ON m.resource_id = r.id
  LEFT JOIN (
    SELECT
      m.resource_id AS id,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description)  AS description
    FROM public.metamagics m
    LEFT JOIN public.metamagic_translations t ON t.resource_id = m.resource_id
    WHERE m.resource_id = p_id
    GROUP BY m.resource_id
  ) tt ON tt.id = r.id;
$$;

ALTER FUNCTION public.fetch_metamagic(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_metamagic(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_metamagic(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_metamagic(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH METAMAGICS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_metamagics(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.metamagic_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'metamagic'::public.resource_kind
),
metamagic AS (
  SELECT b.*, m.sorcery_points
  FROM base b
  JOIN public.metamagics m ON m.resource_id = b.id
),
mt AS (
  SELECT
    m.id,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM metamagic m
  LEFT JOIN public.metamagic_translations t ON t.resource_id = m.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY m.id
)
SELECT
  m.id,
  m.source_id,
  m.source_code,
  m.source_version,
  m.kind,
  m.visibility,
  m.image_url,
  m.name,
  m.name_short,
  m.page,
  m.sorcery_points,
  coalesce(mt.description, '{}'::jsonb)  AS description,
  coalesce(mt.prerequisite, '{}'::jsonb) AS prerequisite
FROM metamagic m
LEFT JOIN mt ON mt.id = m.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (m.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (m.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_metamagics(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_metamagics(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_metamagics(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_metamagics(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT METAMAGIC TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_metamagic_translation(
  p_id uuid,
  p_lang text,
  p_metamagic_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.metamagic_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.metamagic_translations, p_metamagic_translation);

  INSERT INTO public.metamagic_translations AS st (
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

ALTER FUNCTION public.upsert_metamagic_translation(p_id uuid, p_lang text, p_metamagic_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_metamagic_translation(p_id uuid, p_lang text, p_metamagic_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_metamagic_translation(p_id uuid, p_lang text, p_metamagic_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_metamagic_translation(p_id uuid, p_lang text, p_metamagic_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE METAMAGIC
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_metamagic(
  p_id uuid,
  p_lang text,
  p_metamagic jsonb,
  p_metamagic_translation jsonb)
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
    p_metamagic || jsonb_build_object('kind', 'metamagic'::public.resource_kind),
    p_metamagic_translation
  );

  UPDATE public.metamagics m
  SET (
    sorcery_points
  ) = (
    SELECT mm.sorcery_points
    FROM jsonb_populate_record(null::public.metamagics, to_jsonb(m) || p_metamagic) AS mm
  )
  WHERE m.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_metamagic_translation(p_id, p_lang, p_metamagic_translation);
END;
$$;

ALTER FUNCTION public.update_metamagic(p_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_metamagic(p_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_metamagic(p_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_metamagic(p_id uuid, p_lang text, p_metamagic jsonb, p_metamagic_translation jsonb) TO service_role;

