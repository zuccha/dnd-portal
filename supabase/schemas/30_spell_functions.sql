--------------------------------------------------------------------------------
-- SPELL ROW
--------------------------------------------------------------------------------

CREATE TYPE public.spell_row AS (
  -- Resource
  campaign_id uuid,
  campaign_name text,
  id uuid,
  kind public.resource_kind,
  visibility public.campaign_role,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Spell
  casting_time public.spell_casting_time,
  casting_time_value integer,
  character_class_ids uuid[],
  concentration boolean,
  duration public.spell_duration,
  duration_value integer,
  level smallint,
  material boolean,
  range public.spell_range,
  range_value integer,
  ritual boolean,
  school public.spell_school,
  somatic boolean,
  verbal boolean,
  -- Spell Translation
  description jsonb,
  materials jsonb,
  upgrade jsonb
);


--------------------------------------------------------------------------------
-- CREATE SPELL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_spell(
  p_campaign_id uuid,
  p_lang text,
  p_spell jsonb,
  p_spell_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.spells%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.spells, p_spell);

  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_spell || jsonb_build_object('kind', 'spell'::public.resource_kind),
    p_spell_translation
  );

  INSERT INTO public.spells (
    resource_id, level, school,
    casting_time, casting_time_value,
    duration, duration_value, range, range_value,
    concentration, ritual, verbal, somatic, material
  ) VALUES (
    v_id, r.level, r.school,
    r.casting_time, r.casting_time_value,
    r.duration, r.duration_value, r.range, r.range_value,
    r.concentration, r.ritual, r.verbal, r.somatic, r.material
  );

  INSERT INTO public.character_class_spells (character_class_id, spell_id)
  SELECT
    (value)::uuid,
    v_id
  FROM jsonb_array_elements_text(
    coalesce(p_spell->'character_class_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.character_class_spells cs
    WHERE cs.character_class_id = (v.value)::uuid
      AND cs.spell_id = v_id
  );

  perform public.upsert_spell_translation(v_id, p_lang, p_spell_translation);

  RETURN v_id;
end;
$$;

ALTER FUNCTION public.create_spell(p_campaign_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_spell(p_campaign_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_spell(p_campaign_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_spell(p_campaign_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH SPELL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_spell(p_id uuid)
RETURNS public.spell_row
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
    r.name_short,
    r.page,
    s.casting_time,
    s.casting_time_value,
    coalesce(cs.character_class_ids, '{}'::uuid[]) AS character_class_ids,
    s.concentration,
    s.duration,
    s.duration_value,
    s.level,
    s.material,
    s.range,
    s.range_value,
    s.ritual,
    s.school,
    s.somatic,
    s.verbal,
    coalesce(tt.description, '{}'::jsonb) AS description,
    coalesce(tt.materials, '{}'::jsonb)   AS materials,
    coalesce(tt.upgrade, '{}'::jsonb)     AS upgrade
  FROM public.fetch_resource(p_id) AS r
  JOIN public.spells s ON s.resource_id = r.id
  LEFT JOIN (
    SELECT
      cs.spell_id AS id,
      array_agg(cs.character_class_id) AS character_class_ids
    FROM public.character_class_spells cs
    WHERE cs.spell_id = p_id
    GROUP BY cs.spell_id
  ) cs ON cs.id = r.id
  LEFT JOIN (
    SELECT
      s.resource_id AS id,
      jsonb_object_agg(t.lang, t.description) AS description,
      jsonb_object_agg(t.lang, t.materials)   AS materials,
      jsonb_object_agg(t.lang, t.upgrade)     AS upgrade
    FROM public.spells s
    LEFT JOIN public.spell_translations t ON t.resource_id = s.resource_id
    WHERE s.resource_id = p_id
    GROUP BY s.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_spell(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_spell(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_spell(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_spell(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH SPELLS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_spells(
  p_campaign_id uuid, p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.spell_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- campaign/modules include/exclude filter (keys are campaign or module ids)
    coalesce(p_filters->'campaigns', '{}'::jsonb) AS campaign_filter,

    -- levels
    (
      SELECT coalesce(array_agg((e.key)::int), null)
      FROM jsonb_each_text(p_filters->'levels') AS e(key, value)
      WHERE e.value = 'true'
    ) AS levels_inc,
    (
      SELECT coalesce(array_agg((e.key)::int), null)
      FROM jsonb_each_text(p_filters->'levels') AS e(key, value)
      WHERE e.value = 'false'
    ) AS levels_exc,

    -- class ids
    (
      SELECT coalesce(array_agg((e.key)::uuid), null)
      FROM jsonb_each_text(p_filters->'character_class_ids') AS e(key, value)
      WHERE e.value = 'true'
    ) AS classes_ids_inc,
    (
      SELECT coalesce(array_agg((e.key)::uuid), null)
      FROM jsonb_each_text(p_filters->'character_class_ids') AS e(key, value)
      WHERE e.value = 'false'
    ) AS classes_ids_exc,

    -- schools
    (
      SELECT coalesce(array_agg(lower(e.key)::public.spell_school), null)
      FROM jsonb_each_text(p_filters->'schools') AS e(key, value)
      WHERE e.value = 'true'
    ) AS schools_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.spell_school), null)
      FROM jsonb_each_text(p_filters->'schools') AS e(key, value)
      WHERE e.value = 'false'
    ) AS schools_exc,

    -- casting time
    (
      SELECT coalesce(array_agg(lower(e.key)::public.spell_casting_time), null)
      FROM jsonb_each_text(p_filters->'casting_time') AS e(key, value)
      WHERE e.value = 'true'
    ) AS casting_time_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.spell_casting_time), null)
      FROM jsonb_each_text(p_filters->'casting_time') AS e(key, value)
      WHERE e.value = 'false'
    ) AS casting_time_exc,

    -- boolean flags; null = not relevant
    (p_filters ? 'concentration')::int::boolean AS has_conc_filter,
    (p_filters->>'concentration')::boolean      AS conc_val,

    (p_filters ? 'ritual')::int::boolean        AS has_rit_filter,
    (p_filters->>'ritual')::boolean             AS rit_val,

    (p_filters ? 'material')::int::boolean      AS has_mat_filter,
    (p_filters->>'material')::boolean           AS mat_val,

    (p_filters ? 'somatic')::int::boolean       AS has_som_filter,
    (p_filters->>'somatic')::boolean            AS som_val,

    (p_filters ? 'verbal')::int::boolean        AS has_ver_filter,
    (p_filters->>'verbal')::boolean             AS ver_val
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'spell'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.campaign_id,
    b.campaign_name,
    b.kind,
    b.visibility,
    b.name,
    b.name_short,
    b.page,
    s.level,
    s.school,
    coalesce(cs.character_class_ids, '{}'::uuid[]) AS character_class_ids,
    s.concentration,
    s.ritual,
    s.somatic,
    s.verbal,
    s.material,
    s.casting_time,
    s.casting_time_value,
    s.duration,
    s.duration_value,
    s.range,
    s.range_value
  FROM base b
  JOIN public.spells s ON s.resource_id = b.id
  LEFT JOIN (
    SELECT
      cs.spell_id AS id,
      array_agg(cs.character_class_id) AS character_class_ids
    FROM public.character_class_spells cs
    GROUP BY cs.spell_id
  ) cs ON cs.id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    -- levels
        (p.levels_inc IS NULL OR s.level = any(p.levels_inc))
    AND (p.levels_exc IS NULL OR NOT (s.level = any(p.levels_exc)))

    -- classes
    AND (p.classes_ids_inc IS NULL OR s.character_class_ids && p.classes_ids_inc)
    AND (p.classes_ids_exc IS NULL OR NOT (s.character_class_ids && p.classes_ids_exc))

    -- schools
    AND (p.schools_inc IS NULL OR s.school = any(p.schools_inc))
    AND (p.schools_exc IS NULL OR NOT (s.school = any(p.schools_exc)))

    -- casting time
    AND (p.casting_time_inc IS NULL OR s.casting_time = any(p.casting_time_inc))
    AND (p.casting_time_exc IS NULL OR NOT (s.casting_time = any(p.casting_time_exc)))

    -- flags
    AND (not p.has_conc_filter OR s.concentration = p.conc_val)
    AND (not p.has_rit_filter  OR s.ritual        = p.rit_val)
    AND (not p.has_mat_filter  OR s.material      = p.mat_val)
    AND (not p.has_som_filter  OR s.somatic       = p.som_val)
    AND (not p.has_ver_filter  OR s.verbal        = p.ver_val)
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.description) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description,
    jsonb_object_agg(t.lang, t.materials)   FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS materials,
    jsonb_object_agg(t.lang, t.upgrade)     FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS upgrade
  FROM filtered f
  LEFT JOIN public.spell_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.campaign_id,
  f.campaign_name,
  f.id,
  f.kind,
  f.visibility,
  f.name,
  f.name_short,
  f.page,
  f.casting_time,
  f.casting_time_value,
  f.character_class_ids,
  f.concentration,
  f.duration,
  f.duration_value,
  f.level,
  f.material,
  f.range,
  f.range_value,
  f.ritual,
  f.school,
  f.somatic,
  f.verbal,
  coalesce(tt.description, '{}'::jsonb)   AS description,
  coalesce(tt.materials, '{}'::jsonb)     AS materials,
  coalesce(tt.upgrade, '{}'::jsonb)       AS upgrade
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
  END DESC NULLS LAST,
  CASE
    WHEN p_order_by = 'level' AND p_order_dir = 'asc'
      THEN f.level
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'level' AND p_order_dir = 'desc'
      THEN f.level
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT SPELL TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_spell_translation(
  p_id uuid,
  p_lang text,
  p_spell_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.spell_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.spell_translations, p_spell_translation);

  INSERT INTO public.spell_translations AS st (
    resource_id, lang, materials, description, upgrade
  ) VALUES (
    p_id, p_lang, r.materials, r.description, r.upgrade
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    materials = excluded.materials,
    description = excluded.description,
    upgrade = excluded.upgrade;
END;
$$;

ALTER FUNCTION public.upsert_spell_translation(p_id uuid, p_lang text, p_spell_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_spell_translation(p_id uuid, p_lang text, p_spell_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_spell_translation(p_id uuid, p_lang text, p_spell_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_spell_translation(p_id uuid, p_lang text, p_spell_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE SPELL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_spell(
  p_id uuid,
  p_lang text,
  p_spell jsonb,
  p_spell_translation jsonb)
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
    p_spell || jsonb_build_object('kind', 'spell'::public.resource_kind),
    p_spell_translation
  );

  UPDATE public.spells s
  SET (
    level, school, casting_time, casting_time_value,
    duration, duration_value, range, range_value,
    concentration, ritual, verbal, somatic, material
  ) = (
    SELECT r.level, r.school, r.casting_time, r.casting_time_value,
           r.duration, r.duration_value, r.range, r.range_value,
           r.concentration, r.ritual, r.verbal, r.somatic, r.material
    FROM jsonb_populate_record(null::public.spells, to_jsonb(s) || p_spell) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  DELETE FROM public.character_class_spells cs
  WHERE cs.spell_id = p_id
    AND NOT (cs.character_class_id = any(
      coalesce(
        (SELECT array_agg((value)::uuid)
         FROM jsonb_array_elements_text(
           coalesce(p_spell->'character_class_ids', '[]'::jsonb)
         )),
        '{}'::uuid[]
      )
    ));

  INSERT INTO public.character_class_spells (character_class_id, spell_id)
  SELECT
    (value)::uuid,
    p_id
  FROM jsonb_array_elements_text(
    coalesce(p_spell->'character_class_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.character_class_spells cs
    WHERE cs.character_class_id = (v.value)::uuid
      AND cs.spell_id = p_id
  );

  perform public.upsert_spell_translation(p_id, p_lang, p_spell_translation);
END;
$$;

ALTER FUNCTION public.update_spell(p_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_spell(p_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_spell(p_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_spell(p_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb) TO service_role;
