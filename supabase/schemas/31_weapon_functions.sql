--------------------------------------------------------------------------------
-- WEAPON ROW
--------------------------------------------------------------------------------

CREATE TYPE public.weapon_row AS (
  -- Resource
  campaign_id uuid,
  campaign_name text,
  id uuid,
  kind public.resource_kind,
  visibility public.campaign_role,
  name jsonb,
  page jsonb,
  -- Equipment
  cost integer,
  magic boolean,
  rarity public.equipment_rarity,
  weight integer,
  -- Weapon
  damage text,
  damage_type public.damage_type,
  damage_versatile text,
  mastery public.weapon_mastery,
  melee boolean,
  properties public.weapon_property[],
  range_long integer,
  range_short integer,
  ranged boolean,
  type public.weapon_type,
  -- Translation
  ammunition jsonb,
  notes jsonb
);


--------------------------------------------------------------------------------
-- CREATE WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_weapon(
  p_campaign_id uuid,
  p_lang text,
  p_weapon jsonb,
  p_weapon_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.weapons%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.weapons, p_weapon);

  v_id := public.create_equipment(
    p_campaign_id,
    p_lang,
    p_weapon || jsonb_build_object('kind', 'weapon'::public.resource_kind),
    p_weapon_translation
  );

  INSERT INTO public.weapons (
    resource_id, type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged,
    range_short, range_long
  ) VALUES (
    v_id, r.type, r.damage, r.damage_versatile, r.damage_type,
    r.properties, r.mastery, r.melee, r.ranged,
    r.range_short, r.range_long
  );

  perform public.upsert_weapon_translation(v_id, p_lang, p_weapon_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_weapon(p_campaign_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_weapon(p_campaign_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_weapon(p_campaign_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_weapon(p_campaign_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_weapon(p_id uuid)
RETURNS public.weapon_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.campaign_id,
    e.campaign_name,
    e.id,
    e.kind,
    e.visibility,
    e.name,
    e.page,
    e.cost,
    e.magic,
    e.rarity,
    e.weight,
    w.damage,
    w.damage_type,
    w.damage_versatile,
    w.mastery,
    w.melee,
    w.properties,
    w.range_long,
    w.range_short,
    w.ranged,
    w.type,
    coalesce(tt.ammunition, '{}'::jsonb)  AS ammunition,
    e.notes
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.weapons w ON w.resource_id = e.id
  LEFT JOIN (
    SELECT
      w.resource_id AS id,
      jsonb_object_agg(t.lang, t.ammunition)  AS ammunition
    FROM public.weapons w
    LEFT JOIN public.weapon_translations t ON t.resource_id = w.resource_id
    WHERE w.resource_id = p_id
    GROUP BY w.resource_id
  ) tt ON tt.id = e.id
  WHERE e.id = p_id;
$$;

ALTER FUNCTION public.fetch_weapon(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_weapon(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_weapon(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_weapon(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH WEAPONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_weapons(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.weapon_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- campaign/modules include/exclude filter (keys are campaign or module ids)
    coalesce(p_filters->'campaigns', '{}'::jsonb) AS campaign_filter,

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
      FROM jsonb_each_text(p_filters->'properties') AS e(key, value)
      WHERE e.value = 'true'
    ) AS properties_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      FROM jsonb_each_text(p_filters->'properties') AS e(key, value)
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
    (p_filters ? 'melee')::int::boolean   AS has_melee_filter,
    (p_filters->>'melee')::boolean        AS melee_val,

    (p_filters ? 'ranged')::int::boolean  AS has_ranged_filter,
    (p_filters->>'ranged')::boolean       AS ranged_val
),
base AS (
  SELECT e.*
  FROM public.fetch_equipments(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS e
),
src AS (
  SELECT
    b.id,
    b.campaign_id,
    b.campaign_name,
    b.kind,
    b.visibility,
    b.name,
    b.page,
    b.cost,
    b.magic,
    b.rarity,
    b.weight,
    b.notes,
    w.type,
    w.damage,
    w.damage_type,
    w.damage_versatile,
    w.mastery,
    w.properties,
    w.melee,
    w.ranged,
    w.range_long,
    w.range_short
  FROM base b
  JOIN public.weapons w ON w.resource_id = b.id
  JOIN prefs p ON true
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
    AND (NOT p.has_melee_filter  OR s.melee  = p.melee_val)
    AND (NOT p.has_ranged_filter OR s.ranged = p.ranged_val)
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.ammunition)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS ammunition
  FROM filtered f
  LEFT JOIN public.weapon_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.campaign_id,
  f.campaign_name,
  f.id,
  f.kind,
  f.visibility,
  f.name                          AS name,
  f.page                          AS page,
  f.cost,
  f.magic,
  f.rarity,
  f.weight,
  f.damage,
  f.damage_type,
  f.damage_versatile,
  f.mastery,
  f.melee,
  f.properties,
  f.range_long,
  f.range_short,
  f.ranged,
  f.type,
  coalesce(tt.ammunition, '{}'::jsonb)  AS ammunition,
  f.notes                        AS notes
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

ALTER FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT WEAPON TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_weapon_translation(
  p_id uuid,
  p_lang text,
  p_weapon_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.weapon_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.weapon_translations, p_weapon_translation);

  INSERT INTO public.weapon_translations AS wt (
    resource_id, lang, ammunition
  ) VALUES (
    p_id, p_lang, r.ammunition
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    ammunition = excluded.ammunition;

  perform public.upsert_resource_translation(p_id, p_lang, p_weapon_translation);
  perform public.upsert_equipment_translation(p_id, p_lang, p_weapon_translation);
END;
$$;

ALTER FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_weapon(
  p_id uuid,
  p_lang text,
  p_weapon jsonb,
  p_weapon_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows int;
BEGIN
  perform public.update_equipment(
    p_id,
    p_lang,
    p_weapon || jsonb_build_object('kind', 'weapon'::public.resource_kind),
    p_weapon_translation
  );

  UPDATE public.weapons s
  SET (
    type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged,
    range_short, range_long
  ) = (
    SELECT r.type, r.damage, r.damage_versatile, r.damage_type,
           r.properties, r.mastery, r.melee, r.ranged,
           r.range_short, r.range_long
    FROM jsonb_populate_record(null::public.weapons, to_jsonb(s) || p_weapon) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_weapon_translation(p_id, p_lang, p_weapon_translation);
END;
$$;

ALTER FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO service_role;
