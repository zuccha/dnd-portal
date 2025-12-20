set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_weapon(p_campaign_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.weapons%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.weapons, p_weapon);

  INSERT INTO public.weapons (
    campaign_id, type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged, magic,
    range_ft_short, range_ft_long, range_m_short, range_m_long,
    weight_kg, weight_lb, cost, visibility
  ) VALUES (
    p_campaign_id, r.type, r.damage, r.damage_versatile, r.damage_type,
    r.properties, r.mastery, r.melee, r.ranged, r.magic,
    r.range_ft_short, r.range_ft_long, r.range_m_short, r.range_m_long,
    r.weight_kg, r.weight_lb, r.cost, r.visibility
  )
  RETURNING id INTO v_id;

  perform public.upsert_weapon_translation(v_id, p_lang, p_weapon_translation);

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_weapon(p_id uuid)
 RETURNS record
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    w.id,
    w.campaign_id,
    c.name                                AS campaign_name,
    w.type,
    w.damage,
    w.damage_type,
    w.damage_versatile,
    w.mastery,
    w.properties,
    w.magic,
    w.melee,
    w.ranged,
    w.range_ft_long,
    w.range_ft_short,
    w.range_m_long,
    w.range_m_short,
    w.weight_kg,
    w.weight_lb,
    w.cost,
    coalesce(tt.name,       '{}'::jsonb)  AS name,
    coalesce(tt.notes,      '{}'::jsonb)  AS notes,
    coalesce(tt.page,       '{}'::jsonb)  AS page,
    coalesce(tt.ammunition, '{}'::jsonb)  AS ammunition,
    w.visibility
  FROM public.weapons w
  JOIN public.campaigns c ON c.id = w.campaign_id
  LEFT JOIN (
    SELECT
      w.id,
      jsonb_object_agg(t.lang, t.name)        AS name,
      jsonb_object_agg(t.lang, t.notes)       AS notes,
      jsonb_object_agg(t.lang, t.page)        AS page,
      jsonb_object_agg(t.lang, t.ammunition)  AS ammunition
    FROM public.weapons w
    LEFT JOIN public.weapon_translations t ON t.weapon_id = w.id
    WHERE w.id = p_id
    GROUP BY w.id
  ) tt ON tt.id = w.id
  WHERE w.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, type public.weapon_type, damage text, damage_type public.damage_type, damage_versatile text, mastery public.weapon_mastery, properties public.weapon_property[], magic boolean, melee boolean, ranged boolean, range_ft_long real, range_ft_short real, range_m_long real, range_m_short real, weight_kg real, weight_lb real, cost real, name jsonb, notes jsonb, page jsonb, ammunition jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
with prefs AS (
  SELECT
    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.weapon_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.weapon_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc,

    -- properties
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      FROM jsonb_each_text(p_filters->'weapon_properties') AS e(key, value)
      WHERE e.value = 'true'
    ) AS properties_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      FROM jsonb_each_text(p_filters->'weapon_properties') AS e(key, value)
      WHERE e.value = 'false'
    ) AS properties_exc,

    -- mastery
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      FROM jsonb_each_text(p_filters->'masteries') AS e(key, value)
      WHERE e.value = 'true'
    ) AS masteries_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      FROM jsonb_each_text(p_filters->'masteries') AS e(key, value)
      WHERE e.value = 'false'
    ) AS masteries_exc,

    -- boolean flags; null = not relevant
    (p_filters ? 'magic')::int::boolean   AS has_magic_filter,
    (p_filters->>'magic')::boolean        AS magic_val,

    (p_filters ? 'melee')::int::boolean   AS has_melee_filter,
    (p_filters->>'melee')::boolean        AS melee_val,

    (p_filters ? 'ranged')::int::boolean  AS has_ranged_filter,
    (p_filters->>'ranged')::boolean       AS ranged_val
),
src AS (
  SELECT w.*
  FROM public.weapons w
  JOIN public.campaigns c ON c.id = w.campaign_id
  WHERE w.campaign_id = p_campaign_id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    -- types
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))

    -- properties
    AND (p.properties_inc IS NULL OR s.properties && p.properties_inc)
    AND (p.properties_exc IS NULL OR NOT (s.properties && p.properties_exc))

    -- masteries
    AND (p.masteries_inc IS NULL OR s.mastery = any(p.masteries_inc))
    AND (p.masteries_exc IS NULL OR NOT (s.mastery = any(p.masteries_exc)))

    -- flags
    AND (NOT p.has_magic_filter  OR s.magic  = p.magic_val)
    AND (NOT p.has_melee_filter  OR s.melee  = p.melee_val)
    AND (NOT p.has_ranged_filter OR s.ranged = p.ranged_val)
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                AS name,
    jsonb_object_agg(t.lang, t.notes)       FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS notes,
    jsonb_object_agg(t.lang, t.page)        FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS page,
    jsonb_object_agg(t.lang, t.ammunition)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS ammunition
  FROM filtered f
  LEFT JOIN public.weapon_translations t ON t.weapon_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  c.name                                AS campaign_name,
  f.type,
  f.damage,
  f.damage_type,
  f.damage_versatile,
  f.mastery,
  f.properties,
  f.magic,
  f.melee,
  f.ranged,
  f.range_ft_long,
  f.range_ft_short,
  f.range_m_long,
  f.range_m_short,
  f.weight_kg,
  f.weight_lb,
  f.cost,
  coalesce(tt.name,       '{}'::jsonb)  AS name,
  coalesce(tt.notes,      '{}'::jsonb)  AS notes,
  coalesce(tt.page,       '{}'::jsonb)  AS page,
  coalesce(tt.ammunition, '{}'::jsonb)  AS ammunition,
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
  END DESC NULLS LAST;
$function$
;

CREATE OR REPLACE FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.weapons s
  SET (
    type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged, magic,
    range_ft_short, range_ft_long, range_m_short, range_m_long,
    weight_kg, weight_lb, cost, visibility
  ) = (
    SELECT r.type, r.damage, r.damage_versatile, r.damage_type,
           r.properties, r.mastery, r.melee, r.ranged, r.magic,
           r.range_ft_short, r.range_ft_long, r.range_m_short, r.range_m_long,
           r.weight_kg, r.weight_lb, r.cost, r.visibility
    FROM jsonb_populate_record(null::public.weapons, to_jsonb(s) || p_weapon) AS r
  )
  WHERE s.id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_weapon_translation(p_id, p_lang, p_weapon_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  r public.weapon_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.weapon_translations, p_weapon_translation);

  INSERT INTO public.weapon_translations AS st (
    weapon_id, lang, name, page,
    ammunition, notes
  ) VALUES (
    p_id, p_lang, r.name, r.page,
    r.ammunition, r.notes
  )
  ON conflict (weapon_id, lang) DO UPDATE
  SET
    name = excluded.name,
    page = excluded.page,
    ammunition = excluded.ammunition,
    notes = excluded.notes;
END;
$function$
;


