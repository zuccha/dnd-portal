--------------------------------------------------------------------------------
-- SPECIES ROW
--------------------------------------------------------------------------------

CREATE TYPE public.species_row AS (
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
  -- Species
  type public.creature_type,
  sizes public.creature_size[],
  speed integer,
  feature_entries jsonb,
  -- Species Translation
  description jsonb
);


--------------------------------------------------------------------------------
-- CREATE SPECIES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_species(
  p_source_id uuid,
  p_lang text,
  p_species jsonb,
  p_species_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.species%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.species, p_species);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_species || jsonb_build_object('kind', 'species'::public.resource_kind),
    p_species_translation
  );

  INSERT INTO public.species (
    resource_id, type, sizes, speed
  ) VALUES (
    v_id, r.type, r.sizes, r.speed
  );

  perform public.replace_resource_feature_entries(
    v_id,
    coalesce(p_species->'feature_entries', '[]'::jsonb)
  );

  perform public.upsert_species_translation(v_id, p_lang, p_species_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH SPECIES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_species(p_id uuid)
RETURNS public.species_row
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
    s.type,
    s.sizes,
    s.speed,
    public.fetch_resource_feature_entries(r.id) AS feature_entries,
    coalesce(tt.description, '{}'::jsonb) AS description
  FROM public.fetch_resource(p_id) AS r
  JOIN public.species s ON s.resource_id = r.id
  LEFT JOIN (
    SELECT
      s.resource_id AS id,
      jsonb_object_agg(t.lang, t.description) AS description
    FROM public.species s
    LEFT JOIN public.species_translations t ON t.resource_id = s.resource_id
    WHERE s.resource_id = p_id
    GROUP BY s.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_species(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_species(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_species(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_species(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH SPECIES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_species(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.species_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_size), null)
      FROM jsonb_each_text(p_filters->'sizes') AS e(key, value)
      WHERE e.value = 'true'
    ) AS sizes_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_size), null)
      FROM jsonb_each_text(p_filters->'sizes') AS e(key, value)
      WHERE e.value = 'false'
    ) AS sizes_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'species'::public.resource_kind
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
    s.type,
    s.sizes,
    s.speed
  FROM base b
  JOIN public.species s ON s.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
    AND (p.sizes_inc IS NULL OR s.sizes && p.sizes_inc)
    AND (p.sizes_exc IS NULL OR NOT (s.sizes && p.sizes_exc))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.description) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.species_translations t ON t.resource_id = f.id
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
  f.type,
  f.sizes,
  f.speed,
  public.fetch_resource_feature_entries(f.id) AS feature_entries,
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

ALTER FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT SPECIES TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_species_translation(
  p_id uuid,
  p_lang text,
  p_species_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.species_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.species_translations, p_species_translation);

  INSERT INTO public.species_translations AS st (
    resource_id, lang, description
  ) VALUES (
    p_id, p_lang, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    description = excluded.description;

  perform public.upsert_resource_translation(p_id, p_lang, p_species_translation);
END;
$$;

ALTER FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE SPECIES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_species(
  p_id uuid,
  p_lang text,
  p_species jsonb,
  p_species_translation jsonb)
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
    p_species || jsonb_build_object('kind', 'species'::public.resource_kind),
    p_species_translation
  );

  UPDATE public.species s
  SET (
    type,
    sizes,
    speed
  ) = (
    SELECT r.type, r.sizes, r.speed
    FROM jsonb_populate_record(null::public.species, to_jsonb(s) || p_species) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_species ? 'feature_entries' THEN
    perform public.replace_resource_feature_entries(
      p_id,
      p_species->'feature_entries'
    );
  END IF;

  perform public.upsert_species_translation(p_id, p_lang, p_species_translation);
END;
$$;

ALTER FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO service_role;
