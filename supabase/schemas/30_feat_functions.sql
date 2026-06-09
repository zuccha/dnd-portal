--------------------------------------------------------------------------------
-- FEAT ROW
--------------------------------------------------------------------------------

CREATE TYPE public.feat_row AS (
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
  -- Feat
  category public.feat_category,
  min_level smallint,
  feature_entries jsonb,
  -- Feat Translation
  prerequisite jsonb,
  description jsonb
);


--------------------------------------------------------------------------------
-- CREATE FEAT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_feat(
  p_source_id uuid,
  p_lang text,
  p_feat jsonb,
  p_feat_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.feats%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.feats, p_feat);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_feat || jsonb_build_object('kind', 'feat'::public.resource_kind),
    p_feat_translation
  );

  INSERT INTO public.feats (
    resource_id, category, min_level
  ) VALUES (
    v_id, r.category, r.min_level
  );

  perform public.replace_resource_feature_entries(
    v_id,
    coalesce(p_feat->'feature_entries', '[]'::jsonb)
  );

  perform public.upsert_feat_translation(v_id, p_lang, p_feat_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH FEAT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_feat(p_id uuid)
RETURNS public.feat_row
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
    f.category,
    f.min_level,
    public.fetch_resource_feature_entries(r.id) AS feature_entries,
    coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite,
    coalesce(tt.description, '{}'::jsonb) AS description
  FROM public.fetch_resource(p_id) AS r
  JOIN public.feats f ON f.resource_id = r.id
  LEFT JOIN (
    SELECT
      f.resource_id AS id,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description) AS description
    FROM public.feats f
    LEFT JOIN public.feat_translations t ON t.resource_id = f.resource_id
    WHERE f.resource_id = p_id
    GROUP BY f.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_feat(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_feat(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_feat(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_feat(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH FEATS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_feats(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.feat_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    coalesce((p_filters->>'level')::int, 20) AS level,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.feat_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'true'
    ) AS categories_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.feat_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'false'
    ) AS categories_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'feat'::public.resource_kind
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
    b.page,
    f.category,
    f.min_level
  FROM base b
  JOIN public.feats f ON f.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    s.min_level <= p.level
    AND (p.categories_inc IS NULL OR s.category = any(p.categories_inc))
    AND (p.categories_exc IS NULL OR NOT (s.category = any(p.categories_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.feat_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY f.id
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
  f.category,
  f.min_level,
  public.fetch_resource_feature_entries(f.id) AS feature_entries,
  coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite,
  coalesce(tt.description, '{}'::jsonb) AS description
FROM filtered f
LEFT JOIN t tt ON tt.id = f.id
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

ALTER FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT FEAT TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_feat_translation(
  p_id uuid,
  p_lang text,
  p_feat_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.feat_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.feat_translations, p_feat_translation);

  INSERT INTO public.feat_translations AS ft (
    resource_id, lang, prerequisite, description
  ) VALUES (
    p_id, p_lang, r.prerequisite, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    prerequisite = excluded.prerequisite,
    description = excluded.description;

  perform public.upsert_resource_translation(p_id, p_lang, p_feat_translation);
END;
$$;

ALTER FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE FEAT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_feat(
  p_id uuid,
  p_lang text,
  p_feat jsonb,
  p_feat_translation jsonb)
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
    p_feat || jsonb_build_object('kind', 'feat'::public.resource_kind),
    p_feat_translation
  );

  UPDATE public.feats f
  SET (
    category,
    min_level
  ) = (
    SELECT r.category, r.min_level
    FROM jsonb_populate_record(null::public.feats, to_jsonb(f) || p_feat) AS r
  )
  WHERE f.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_feat ? 'feature_entries' THEN
    perform public.replace_resource_feature_entries(
      p_id,
      p_feat->'feature_entries'
    );
  END IF;

  perform public.upsert_feat_translation(p_id, p_lang, p_feat_translation);
END;
$$;

ALTER FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO service_role;
