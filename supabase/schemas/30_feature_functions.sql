--------------------------------------------------------------------------------
-- FEATURE ROW
--------------------------------------------------------------------------------

CREATE TYPE public.feature_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Feature Translation
  description jsonb,
  -- Resource Features
  granted_by jsonb
);


--------------------------------------------------------------------------------
-- CREATE FEATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_feature(
  p_source_id uuid,
  p_lang text,
  p_feature jsonb,
  p_feature_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.features%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.features, p_feature);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_feature || jsonb_build_object('kind', 'feature'::public.resource_kind),
    p_feature_translation
  );

  INSERT INTO public.features (
    resource_id
  ) VALUES (
    v_id
  );

  INSERT INTO public.resource_features (
    resource_id,
    feature_id,
    min_level,
    position
  )
  SELECT
    (a.value->>'id')::uuid,
    v_id,
    coalesce((a.value->>'min_level')::smallint, 0),
    coalesce((a.value->>'position')::smallint, (a.ordinality - 1)::smallint)
  FROM jsonb_array_elements(coalesce(p_feature->'granted_by', '[]'::jsonb)) WITH ORDINALITY AS a(value, ordinality);

  perform public.upsert_feature_translation(v_id, p_lang, p_feature_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_feature(p_source_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH FEATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_feature(p_id uuid)
RETURNS public.feature_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.source_id,
    r.source_code,
    r.source_version,
    r.id,
    r.kind,
    r.visibility,
    r.image_url,
    r.name,
    r.name_short,
    r.page,
    coalesce(tt.description, '{}'::jsonb) AS description,
    coalesce(g.granted_by, '[]'::jsonb) AS granted_by
  FROM public.fetch_resource(p_id) AS r
  JOIN public.features f ON f.resource_id = r.id
  LEFT JOIN (
    SELECT
      f.resource_id AS id,
      jsonb_object_agg(t.lang, t.description) AS description
    FROM public.features f
    LEFT JOIN public.feature_translations t ON t.resource_id = f.resource_id
    WHERE f.resource_id = p_id
    GROUP BY f.resource_id
  ) tt ON tt.id = r.id
  LEFT JOIN (
    SELECT
      rf.feature_id AS id,
      jsonb_agg(
        jsonb_build_object(
          'id', rf.resource_id,
          'min_level', rf.min_level
        )
        ORDER BY rf.position, rf.resource_id
      ) AS granted_by
    FROM public.resource_features rf
    WHERE rf.feature_id = p_id
    GROUP BY rf.feature_id
  ) g ON g.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_feature(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_feature(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_feature(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_feature(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH FEATURES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_features(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.feature_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'feature'::public.resource_kind
),
src AS (
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
    b.page
  FROM base b
  JOIN public.features f ON f.resource_id = b.id
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.description) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM src f
  LEFT JOIN public.feature_translations t ON t.resource_id = f.id
  GROUP BY f.id
),
g AS (
  SELECT
    rf.feature_id AS id,
    jsonb_agg(
      jsonb_build_object(
        'id', rf.resource_id,
        'min_level', rf.min_level
      )
      ORDER BY rf.position, rf.resource_id
    ) AS granted_by
  FROM public.resource_features rf
  GROUP BY rf.feature_id
)
SELECT
  f.source_id,
  f.source_code,
  f.source_version,
  f.id,
  f.kind,
  f.visibility,
  f.image_url,
  f.name,
  f.name_short,
  f.page,
  coalesce(tt.description, '{}'::jsonb) AS description,
  coalesce(g.granted_by, '[]'::jsonb) AS granted_by
FROM src f
LEFT JOIN t tt ON tt.id = f.id
LEFT JOIN g ON g.id = f.id
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

ALTER FUNCTION public.fetch_features(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_features(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_features(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_features(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT FEATURE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_feature_translation(
  p_id uuid,
  p_lang text,
  p_feature_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.feature_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.feature_translations, p_feature_translation);

  INSERT INTO public.feature_translations AS ft (
    resource_id, lang, description
  ) VALUES (
    p_id, p_lang, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    description = excluded.description;

  perform public.upsert_resource_translation(p_id, p_lang, p_feature_translation);
END;
$$;

ALTER FUNCTION public.upsert_feature_translation(p_id uuid, p_lang text, p_feature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_feature_translation(p_id uuid, p_lang text, p_feature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_feature_translation(p_id uuid, p_lang text, p_feature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_feature_translation(p_id uuid, p_lang text, p_feature_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE FEATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_feature(
  p_id uuid,
  p_lang text,
  p_feature jsonb,
  p_feature_translation jsonb)
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
    p_feature || jsonb_build_object('kind', 'feature'::public.resource_kind),
    p_feature_translation
  );

  UPDATE public.features f
  SET resource_id = f.resource_id
  WHERE f.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_feature ? 'granted_by' THEN
    DELETE FROM public.resource_features rf
    WHERE rf.feature_id = p_id;

    INSERT INTO public.resource_features (
      resource_id,
      feature_id,
      min_level,
      position
    )
    SELECT
      (a.value->>'id')::uuid,
      p_id,
      coalesce((a.value->>'min_level')::smallint, 0),
      coalesce((a.value->>'position')::smallint, (a.ordinality - 1)::smallint)
    FROM jsonb_array_elements(coalesce(p_feature->'granted_by', '[]'::jsonb)) WITH ORDINALITY AS a(value, ordinality);
  END IF;

  perform public.upsert_feature_translation(p_id, p_lang, p_feature_translation);
END;
$$;

ALTER FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_feature(p_id uuid, p_lang text, p_feature jsonb, p_feature_translation jsonb) TO service_role;
