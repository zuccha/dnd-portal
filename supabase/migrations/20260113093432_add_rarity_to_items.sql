drop function public.fetch_equipment(uuid);
drop function public.fetch_armor(uuid);
drop function public.fetch_item(uuid);
drop function public.fetch_tool(uuid);
drop function public.fetch_weapon(uuid);
drop function public.fetch_equipments(uuid, text[], jsonb, text, text);
drop function public.fetch_armors(uuid, text[], jsonb, text, text);
drop function public.fetch_items(uuid, text[], jsonb, text, text);
drop function public.fetch_tools(uuid, text[], jsonb, text, text);
drop function public.fetch_weapons(uuid, text[], jsonb, text, text);

create type "public"."equipment_rarity" as enum ('common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact');

drop type "public"."armor_row";

drop type "public"."equipment_row";

drop type "public"."item_row";

drop type "public"."tool_row";

drop type "public"."weapon_row";

alter table "public"."equipments" add column "rarity" public.equipment_rarity not null default 'common'::public.equipment_rarity;

set check_function_bodies = off;

create type "public"."armor_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "armor_class_max_cha_modifier" smallint, "armor_class_max_con_modifier" smallint, "armor_class_max_dex_modifier" smallint, "armor_class_max_int_modifier" smallint, "armor_class_max_str_modifier" smallint, "armor_class_max_wis_modifier" smallint, "armor_class_modifier" smallint, "base_armor_class" smallint, "disadvantage_on_stealth" boolean, "required_cha" smallint, "required_con" smallint, "required_dex" smallint, "required_int" smallint, "required_str" smallint, "required_wis" smallint, "type" public.armor_type, "notes" jsonb);

create type "public"."equipment_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "notes" jsonb);

create type "public"."item_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "notes" jsonb);

create type "public"."tool_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "notes" jsonb, "ability" public.creature_ability, "type" public.tool_type, "craft" jsonb, "utilize" jsonb);

create type "public"."weapon_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "damage" text, "damage_type" public.damage_type, "damage_versatile" text, "mastery" public.weapon_mastery, "melee" boolean, "properties" public.weapon_property[], "range_long" integer, "range_short" integer, "ranged" boolean, "type" public.weapon_type, "ammunition" jsonb, "notes" jsonb);

CREATE OR REPLACE FUNCTION public.create_equipment(p_campaign_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.equipments%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipments, p_equipment);

  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_equipment || jsonb_build_object(
      'kind',
      coalesce(
        (p_equipment->>'kind')::public.resource_kind,
        'equipment'::public.resource_kind
      )
    ),
    p_equipment_translation
  );

  INSERT INTO public.equipments (
    resource_id, cost, magic, rarity, weight
  ) VALUES (
    v_id, r.cost, r.magic, r.rarity, r.weight
  );

  perform public.upsert_equipment_translation(v_id, p_lang, p_equipment_translation);

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_armor(p_id uuid)
 RETURNS public.armor_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_armors(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.armor_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    -- campaign/modules include/exclude filter (keys are campaign or module ids)
    coalesce(p_filters->'campaigns', '{}'::jsonb) AS campaign_filter,

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
  f.campaign_id,
  f.campaign_name,
  f.id,
  f.kind,
  f.visibility,
  f.name                          AS name,
  f.page                          AS page,
  f.cost,
  f.magic,
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_equipment(p_id uuid)
 RETURNS public.equipment_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    r.campaign_id,
    r.campaign_name,
    r.id,
    r.kind,
    r.visibility,
    r.name,
    r.page,
    e.cost,
    e.magic,
    e.rarity,
    e.weight,
    coalesce(tt.notes, '{}'::jsonb) AS notes
  FROM public.fetch_resource(p_id) AS r
  JOIN public.equipments e ON e.resource_id = r.id
  LEFT JOIN (
    SELECT
      e.resource_id AS id,
      jsonb_object_agg(t.lang, t.notes) AS notes
    FROM public.equipments e
    LEFT JOIN public.equipment_translations t ON t.resource_id = e.resource_id
    WHERE e.resource_id = p_id
    GROUP BY e.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.equipment_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    (p_filters ? 'magic')::int::boolean   AS has_magic_filter,
    (p_filters->>'magic')::boolean        AS magic_val,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.equipment_rarity), null)
      FROM jsonb_each_text(p_filters->'rarity') AS e(key, value)
      WHERE e.value = 'true'
    ) AS rarity_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.equipment_rarity), null)
      FROM jsonb_each_text(p_filters->'rarity') AS e(key, value)
      WHERE e.value = 'false'
    ) AS rarity_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = any(ARRAY[
    'equipment'::public.resource_kind,
    'armor'::public.resource_kind,
    'weapon'::public.resource_kind,
    'tool'::public.resource_kind,
    'item'::public.resource_kind
  ])
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
    e.cost,
    e.magic,
    e.rarity,
    e.weight
  FROM base b
  JOIN public.equipments e ON e.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (not p.has_magic_filter OR s.magic = p.magic_val)
    AND (p.rarity_inc IS NULL OR s.rarity = any(p.rarity_inc))
    AND (p.rarity_exc IS NULL OR NOT (s.rarity = any(p.rarity_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.notes) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS notes
  FROM filtered f
  LEFT JOIN public.equipment_translations t ON t.resource_id = f.id
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
  f.page,
  f.cost,
  f.magic,
  f.rarity,
  f.weight,
  coalesce(tt.notes, '{}'::jsonb) AS notes
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_item(p_id uuid)
 RETURNS public.item_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
    e.notes
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.items i ON i.resource_id = e.id
  WHERE e.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_items(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.item_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH base AS (
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
    b.notes
  FROM base b
  JOIN public.items i ON i.resource_id = b.id
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.page,
  s.cost,
  s.magic,
  s.rarity,
  s.weight,
  s.notes
FROM src s
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_tool(p_id uuid)
 RETURNS public.tool_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
    e.notes,
    t.ability,
    t.type,
    coalesce(tt.craft, '{}'::jsonb) AS craft,
    coalesce(tt.utilize, '{}'::jsonb) AS utilize
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.tools t ON t.resource_id = e.id
  LEFT JOIN (
    SELECT
      t.resource_id AS id,
      jsonb_object_agg(tt.lang, tt.craft) AS craft,
      jsonb_object_agg(tt.lang, tt.utilize) AS utilize
    FROM public.tools t
    LEFT JOIN public.tool_translations tt ON tt.resource_id = t.resource_id
    WHERE t.resource_id = p_id
    GROUP BY t.resource_id
  ) tt ON tt.id = e.id
  WHERE e.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_tools(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.tool_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.tool_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.tool_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc,

    -- abilities
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_ability), null)
      FROM jsonb_each_text(p_filters->'abilities') AS e(key, value)
      WHERE e.value = 'true'
    ) AS abilities_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_ability), null)
      FROM jsonb_each_text(p_filters->'abilities') AS e(key, value)
      WHERE e.value = 'false'
    ) AS abilities_exc
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
    t.ability,
    t.type
  FROM base b
  JOIN public.tools t ON t.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
    AND (p.abilities_inc IS NULL OR s.ability = any(p.abilities_inc))
    AND (p.abilities_exc IS NULL OR NOT (s.ability = any(p.abilities_exc)))
),
tt AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.craft) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS craft,
    jsonb_object_agg(t.lang, t.utilize) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS utilize
  FROM filtered f
  LEFT JOIN public.tool_translations t ON t.resource_id = f.id
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
  f.page,
  f.cost,
  f.magic,
  f.rarity,
  f.weight,
  f.notes,
  f.ability,
  f.type,
  coalesce(tt.craft, '{}'::jsonb) AS craft,
  coalesce(tt.utilize, '{}'::jsonb) AS utilize
FROM filtered f
LEFT JOIN tt ON tt.id = f.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (f.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (f.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_weapon(p_id uuid)
 RETURNS public.weapon_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.weapon_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_rows int;
BEGIN
  perform public.update_resource(
    p_id,
    p_lang,
    p_equipment || jsonb_build_object(
      'kind',
      coalesce(
        (p_equipment->>'kind')::public.resource_kind,
        'equipment'::public.resource_kind
      )
    ),
    p_equipment_translation
  );

  UPDATE public.equipments e
  SET (
    cost, magic, rarity, weight
  ) = (
    SELECT r.cost, r.magic, r.rarity, r.weight
    FROM jsonb_populate_record(null::public.equipments, to_jsonb(e) || p_equipment) AS r
  )
  WHERE e.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_equipment_translation(p_id, p_lang, p_equipment_translation);
END;
$function$
;
