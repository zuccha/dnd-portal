alter table "public"."spells" drop constraint "spells_casting_time_pair_chk";

drop function if exists "public"."fetch_spells"(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

alter table "public"."spells" add column "casting_time_value_temp" integer;

UPDATE public.spells
SET casting_time_value_temp =
  CASE
    WHEN casting_time_value like '% s' THEN (substring(casting_time_value from 1 for length(casting_time_value) - 2)::numeric * 1::integer)::integer
    WHEN casting_time_value like '% round' THEN (substring(casting_time_value from 1 for length(casting_time_value) - 6)::numeric * 6::integer)::integer
    WHEN casting_time_value like '% min' THEN (substring(casting_time_value from 1 for length(casting_time_value) - 4)::numeric * 60::integer)::integer
    WHEN casting_time_value like '% hr' THEN (substring(casting_time_value from 1 for length(casting_time_value) - 3)::numeric * 3600::integer)::integer
    WHEN casting_time_value like '% d' THEN (substring(casting_time_value from 1 for length(casting_time_value) - 2)::numeric * 86400::integer)::integer
    ELSE NULL
  END
WHERE casting_time_value IS NOT NULL;

alter table "public"."spells" add constraint "spells_casting_time_pair_chk" CHECK ((((casting_time = 'value'::public.spell_casting_time) = (casting_time_value IS NOT NULL)) AND ((casting_time = 'value'::public.spell_casting_time) = (casting_time_value_temp IS NOT NULL)))) not valid;

alter table "public"."spells" validate constraint "spells_casting_time_pair_chk";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_spell(p_campaign_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.spells%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.spells, p_spell);

  INSERT INTO public.spells (
    campaign_id, level, school,
    character_classes, casting_time, casting_time_value, casting_time_value_temp,
    duration, duration_value, range, range_value, range_value_imp, range_value_met,
    concentration, ritual, verbal, somatic, material, visibility
  ) VALUES (
    p_campaign_id, r.level, r.school,
    r.character_classes, r.casting_time, r.casting_time_value, r.casting_time_value_temp,
    r.duration, r.duration_value, r.range, r.range_value, r.range_value_imp, r.range_value_met,
    r.concentration, r.ritual, r.verbal, r.somatic, r.material, r.visibility
  )
  RETURNING id INTO v_id;

  perform public.upsert_spell_translation(v_id, p_lang, p_spell_translation);

  RETURN v_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_spell(p_id uuid)
 RETURNS record
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    s.id,
    s.campaign_id,
    c.name                                AS campaign_name,
    s.level,
    s.character_classes,
    s.school,
    s.casting_time,
    s.casting_time_value,
    s.casting_time_value_temp,
    s.duration,
    s.duration_value,
    s.range,
    s.range_value,
    s.range_value_imp,
    s.range_value_met,
    s.concentration,
    s.ritual,
    s.somatic,
    s.verbal,
    s.material,
    coalesce(tt.name, '{}'::jsonb)        AS name,
    coalesce(tt.description, '{}'::jsonb) AS description,
    coalesce(tt.materials, '{}'::jsonb)   AS materials,
    coalesce(tt.page, '{}'::jsonb)        AS page,
    coalesce(tt.upgrade, '{}'::jsonb)     AS upgrade,
    s.visibility
  FROM public.spells s
  JOIN public.campaigns c ON c.id = s.campaign_id
  LEFT JOIN (
    SELECT
      s.id,
      jsonb_object_agg(t.lang, t.name)        AS name,
      jsonb_object_agg(t.lang, t.description) AS description,
      jsonb_object_agg(t.lang, t.materials)   AS materials,
      jsonb_object_agg(t.lang, t.page)        AS page,
      jsonb_object_agg(t.lang, t.upgrade)     AS upgrade
    FROM public.spells s
    LEFT JOIN public.spell_translations t ON t.spell_id = s.id
    WHERE s.id = p_id
    GROUP BY s.id
  ) tt ON tt.id = s.id
  WHERE s.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, level smallint, character_classes public.character_class[], school public.spell_school, casting_time public.spell_casting_time, casting_time_value text, casting_time_value_temp integer, duration public.spell_duration, duration_value text, range public.spell_range, range_value integer, range_value_imp text, range_value_met text, concentration boolean, ritual boolean, somatic boolean, verbal boolean, material boolean, name jsonb, description jsonb, materials jsonb, page jsonb, upgrade jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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

    -- classes
    (
      SELECT coalesce(array_agg(lower(e.key)::public.character_class), null)
      FROM jsonb_each_text(p_filters->'character_classes') AS e(key, value)
      WHERE e.value = 'true'
    ) AS classes_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.character_class), null)
      FROM jsonb_each_text(p_filters->'character_classes') AS e(key, value)
      WHERE e.value = 'false'
    ) AS classes_exc,

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
src AS (
  SELECT s.*
  FROM public.spells s
  JOIN prefs p ON true
  JOIN public.campaign_resource_ids(p_campaign_id, p.campaign_filter) ci ON ci.id = s.campaign_id
  JOIN public.campaigns c ON c.id = s.campaign_id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    -- levels
        (p.levels_inc IS NULL OR s.level = any(p.levels_inc))
    AND (p.levels_exc IS NULL OR NOT (s.level = any(p.levels_exc)))

    -- classes
    AND (p.classes_inc IS NULL OR s.character_classes && p.classes_inc)
    AND (p.classes_exc IS NULL OR NOT (s.character_classes && p.classes_exc))

    -- schools
    AND (p.schools_inc IS NULL OR s.school = any(p.schools_inc))
    AND (p.schools_exc IS NULL OR NOT (s.school = any(p.schools_exc)))

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
    jsonb_object_agg(t.lang, t.name)                                                                                AS name,
    jsonb_object_agg(t.lang, t.description) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description,
    jsonb_object_agg(t.lang, t.materials)   FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS materials,
    jsonb_object_agg(t.lang, t.page)        FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS page,
    jsonb_object_agg(t.lang, t.upgrade)     FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS upgrade
  FROM filtered f
  LEFT JOIN public.spell_translations t ON t.spell_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  c.name                                  AS campaign_name,
  f.level,
  f.character_classes,
  f.school,
  f.casting_time,
  f.casting_time_value,
  f.casting_time_value_temp,
  f.duration,
  f.duration_value,
  f.range,
  f.range_value,
  f.range_value_imp,
  f.range_value_met,
  f.concentration,
  f.ritual,
  f.somatic,
  f.verbal,
  f.material,
  coalesce(tt.name, '{}'::jsonb)          AS name,
  coalesce(tt.description, '{}'::jsonb)   AS description,
  coalesce(tt.materials, '{}'::jsonb)     AS materials,
  coalesce(tt.page, '{}'::jsonb)          AS page,
  coalesce(tt.upgrade, '{}'::jsonb)       AS upgrade,
  f.visibility
FROM filtered f
JOIN public.campaigns c ON c.id = f.campaign_id
LEFT JOIN t tt ON tt.id = f.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (tt.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (tt.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST,
  CASE
    WHEN p_order_by = 'level' AND p_order_dir = 'asc'
      THEN f.level
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'level' AND p_order_dir = 'desc'
      THEN f.level
  END DESC NULLS LAST;
$function$
;

CREATE OR REPLACE FUNCTION public.update_spell(p_id uuid, p_lang text, p_spell jsonb, p_spell_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.spells s
  SET (
    level, school, character_classes, casting_time, casting_time_value, casting_time_value_temp,
    duration, duration_value, range, range_value, range_value_imp, range_value_met,
    concentration, ritual, verbal, somatic, material, visibility
  ) = (
    SELECT r.level, r.school, r.character_classes, r.casting_time, r.casting_time_value, r.casting_time_value_temp,
           r.duration, r.duration_value, r.range, r.range_value, r.range_value_imp, r.range_value_met,
           r.concentration, r.ritual, r.verbal, r.somatic, r.material, r.visibility
    FROM jsonb_populate_record(null::public.spells, to_jsonb(s) || p_spell) AS r
  )
  WHERE s.id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_spell_translation(p_id, p_lang, p_spell_translation);
END;
$function$
;


