--------------------------------------------------------------------------------
-- ARMOR ROW
--------------------------------------------------------------------------------

CREATE TYPE public.armor_row AS (
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
  -- Equipment
  cost integer,
  magic boolean,
  rarity public.equipment_rarity,
  weight integer,
  -- Armor
  armor_class_max_cha_modifier smallint,
  armor_class_max_con_modifier smallint,
  armor_class_max_dex_modifier smallint,
  armor_class_max_int_modifier smallint,
  armor_class_max_str_modifier smallint,
  armor_class_max_wis_modifier smallint,
  armor_class_modifier smallint,
  base_armor_class smallint,
  disadvantage_on_stealth boolean,
  required_cha smallint,
  required_con smallint,
  required_dex smallint,
  required_int smallint,
  required_str smallint,
  required_wis smallint,
  type public.armor_type,
  -- Translation
  notes jsonb
);


--------------------------------------------------------------------------------
-- CREATE ARMOR
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_armor(
  p_source_id uuid,
  p_lang text,
  p_armor jsonb,
  p_armor_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.armors%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.armors, p_armor);

  v_id := public.create_equipment(
    p_source_id,
    p_lang,
    p_armor || jsonb_build_object('kind', 'armor'::public.resource_kind),
    p_armor_translation
  );

  INSERT INTO public.armors (
    resource_id,
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type
  ) VALUES (
    v_id,
    r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
    r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
    r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
    r.armor_class_modifier, r.base_armor_class,
    r.disadvantage_on_stealth,
    r.required_cha, r.required_con, r.required_dex,
    r.required_int, r.required_str, r.required_wis,
    r.type
  );

  perform public.upsert_armor_translation(v_id, p_lang, p_armor_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_armor(p_source_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_armor(p_source_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_armor(p_source_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_armor(p_source_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ARMOR
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_armor(p_id uuid)
RETURNS public.armor_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.source_id,
    e.source_code,
    e.id,
    e.kind,
    e.visibility,
    e.image_url,
    e.name,
    e.name_short,
    e.page,
    e.cost,
    e.magic,
    e.rarity,
    e.weight,
    a.armor_class_max_cha_modifier,
    a.armor_class_max_con_modifier,
    a.armor_class_max_dex_modifier,
    a.armor_class_max_int_modifier,
    a.armor_class_max_str_modifier,
    a.armor_class_max_wis_modifier,
    a.armor_class_modifier,
    a.base_armor_class,
    a.disadvantage_on_stealth,
    a.required_cha,
    a.required_con,
    a.required_dex,
    a.required_int,
    a.required_str,
    a.required_wis,
    a.type,
    e.notes
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.armors a ON a.resource_id = e.id
  WHERE e.id = p_id;
$$;

ALTER FUNCTION public.fetch_armor(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_armor(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_armor(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_armor(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ARMORS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_armors(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.armor_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- campaign/modules include/exclude filter (keys are campaign or module ids)
    coalesce(p_filters->'sources', '{}'::jsonb) AS campaign_filter,

    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.armor_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.armor_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc
),
base AS (
  SELECT e.*
  FROM public.fetch_equipments(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS e
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
    b.notes,
    a.armor_class_max_cha_modifier,
    a.armor_class_max_con_modifier,
    a.armor_class_max_dex_modifier,
    a.armor_class_max_int_modifier,
    a.armor_class_max_str_modifier,
    a.armor_class_max_wis_modifier,
    a.armor_class_modifier,
    a.base_armor_class,
    a.disadvantage_on_stealth,
    a.required_cha,
    a.required_con,
    a.required_dex,
    a.required_int,
    a.required_str,
    a.required_wis,
    a.type,
    e.cost,
    e.magic,
    e.rarity,
    e.weight
  FROM base b
  JOIN public.armors a ON a.resource_id = b.id
  JOIN public.equipments e ON e.resource_id = b.id
  JOIN prefs p ON true
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    -- types
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
)
SELECT
  f.source_id,
  f.source_code,
  f.id,
  f.kind,
  f.visibility,
  f.image_url,
  f.name                          AS name,
  f.name_short                    AS name_short,
  f.page                          AS page,
  f.cost,
  f.magic,
  f.rarity,
  f.weight,
  f.armor_class_max_cha_modifier,
  f.armor_class_max_con_modifier,
  f.armor_class_max_dex_modifier,
  f.armor_class_max_int_modifier,
  f.armor_class_max_str_modifier,
  f.armor_class_max_wis_modifier,
  f.armor_class_modifier,
  f.base_armor_class,
  f.disadvantage_on_stealth,
  f.required_cha,
  f.required_con,
  f.required_dex,
  f.required_int,
  f.required_str,
  f.required_wis,
  f.type,
  f.notes                         AS notes
FROM filtered f
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

ALTER FUNCTION public.fetch_armors(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_armors(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_armors(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_armors(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT ARMOR TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_armor_translation(
  p_id uuid,
  p_lang text,
  p_armor_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.armor_translations AS at (resource_id, lang)
  VALUES (p_id, p_lang)
  ON conflict (resource_id, lang) DO NOTHING;

  perform public.upsert_resource_translation(p_id, p_lang, p_armor_translation);
  perform public.upsert_equipment_translation(p_id, p_lang, p_armor_translation);
END;
$$;

ALTER FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE ARMOR
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_armor(
  p_id uuid,
  p_lang text,
  p_armor jsonb,
  p_armor_translation jsonb)
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
    p_armor || jsonb_build_object('kind', 'armor'::public.resource_kind),
    p_armor_translation
  );

  UPDATE public.armors s
  SET (
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type
  ) = (
    SELECT r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
      r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
      r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
      r.armor_class_modifier, r.base_armor_class,
      r.disadvantage_on_stealth,
      r.required_cha, r.required_con, r.required_dex,
      r.required_int, r.required_str, r.required_wis,
      r.type
    FROM jsonb_populate_record(null::public.armors, to_jsonb(s) || p_armor) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_armor_translation(p_id, p_lang, p_armor_translation);
END;
$$;

ALTER FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO service_role;
