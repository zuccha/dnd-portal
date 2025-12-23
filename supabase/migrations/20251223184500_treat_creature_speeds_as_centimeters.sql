drop function if exists "public"."fetch_creatures"(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

alter table "public"."creatures" alter column "speed_burrow" set default 0;

alter table "public"."creatures" alter column "speed_burrow" set data type integer using "speed_burrow"::integer;

alter table "public"."creatures" alter column "speed_climb" set default 0;

alter table "public"."creatures" alter column "speed_climb" set data type integer using "speed_climb"::integer;

alter table "public"."creatures" alter column "speed_fly" set default 0;

alter table "public"."creatures" alter column "speed_fly" set data type integer using "speed_fly"::integer;

alter table "public"."creatures" alter column "speed_swim" set default 0;

alter table "public"."creatures" alter column "speed_swim" set data type integer using "speed_swim"::integer;

alter table "public"."creatures" alter column "speed_walk" set default 0;

alter table "public"."creatures" alter column "speed_walk" set data type integer using "speed_walk"::integer;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, alignment public.creature_alignment, habitats public.creature_habitat[], size public.creature_size, treasures public.creature_treasure[], type public.creature_type, ac smallint, cr numeric, hp smallint, hp_formula text, speed_burrow integer, speed_climb integer, speed_fly integer, speed_swim integer, speed_walk integer, ability_cha smallint, ability_con smallint, ability_dex smallint, ability_int smallint, ability_str smallint, ability_wis smallint, initiative smallint, passive_perception smallint, ability_proficiencies public.creature_ability[], skill_proficiencies public.creature_skill[], skill_expertise public.creature_skill[], damage_immunities public.damage_type[], damage_resistances public.damage_type[], damage_vulnerabilities public.damage_type[], condition_immunities public.creature_condition[], condition_resistances public.creature_condition[], condition_vulnerabilities public.creature_condition[], name jsonb, page jsonb, gear jsonb, languages jsonb, planes jsonb, senses jsonb, traits jsonb, actions jsonb, bonus_actions jsonb, legendary_actions jsonb, reactions jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    -- campaign/modules include/exclude filter (keys are campaign or module ids)
    coalesce(p_filters->'campaigns', '{}'::jsonb) AS campaign_filter,

    -- types
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

    -- habitats
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_habitat), null)
      FROM jsonb_each_text(p_filters->'habitats') AS e(key, value)
      WHERE e.value = 'true'
    ) AS habitats_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_habitat), null)
      FROM jsonb_each_text(p_filters->'habitats') AS e(key, value)
      WHERE e.value = 'false'
    ) AS habitats_exc,

    -- treasures
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_treasure), null)
      FROM jsonb_each_text(p_filters->'treasures') AS e(key, value)
      WHERE e.value = 'true'
    ) AS treasures_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_treasure), null)
      FROM jsonb_each_text(p_filters->'treasures') AS e(key, value)
      WHERE e.value = 'false'
    ) AS treasures_exc,

    -- alignment
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_alignment), null)
      FROM jsonb_each_text(p_filters->'alignment') AS e(key, value)
      WHERE e.value = 'true'
    ) AS alignment_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_alignment), null)
      FROM jsonb_each_text(p_filters->'alignment') AS e(key, value)
      WHERE e.value = 'false'
    ) AS alignment_exc,

    -- size
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_size), null)
      FROM jsonb_each_text(p_filters->'size') AS e(key, value)
      WHERE e.value = 'true'
    ) AS size_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_size), null)
      FROM jsonb_each_text(p_filters->'size') AS e(key, value)
      WHERE e.value = 'false'
    ) AS size_exc,

    -- CR range
    coalesce((p_filters->>'cr_min')::numeric, 0) AS cr_min,
    coalesce((p_filters->>'cr_max')::numeric, 30) AS cr_max
),
src AS (
  SELECT c.*
  FROM public.creatures c
  JOIN prefs p ON true
  JOIN public.campaign_resource_ids(p_campaign_id, p.campaign_filter) ci ON ci.id = c.campaign_id
  JOIN public.campaigns cmp ON cmp.id = c.campaign_id
),
filtered AS (
  SELECT c.*
  FROM src c, prefs p
  WHERE
    -- types
        (p.types_inc IS NULL OR c.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (c.type = any(p.types_exc)))

    -- habitats (array overlap)
    AND (p.habitats_inc IS NULL OR c.habitats && p.habitats_inc)
    AND (p.habitats_exc IS NULL OR NOT (c.habitats && p.habitats_exc))

    -- treasures (array overlap)
    AND (p.treasures_inc IS NULL OR c.treasures && p.treasures_inc)
    AND (p.treasures_exc IS NULL OR NOT (c.treasures && p.treasures_exc))

    -- alignment
    AND (p.alignment_inc IS NULL OR c.alignment = any(p.alignment_inc))
    AND (p.alignment_exc IS NULL OR NOT (c.alignment = any(p.alignment_exc)))

    -- size
    AND (p.size_inc IS NULL OR c.size = any(p.size_inc))
    AND (p.size_exc IS NULL OR NOT (c.size = any(p.size_exc)))

    -- CR range
    AND c.cr >= p.cr_min
    AND c.cr <= p.cr_max
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                      AS name,
    jsonb_object_agg(t.lang, t.page)              FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS page,
    jsonb_object_agg(t.lang, t.gear)              FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS gear,
    jsonb_object_agg(t.lang, t.languages)         FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS languages,
    jsonb_object_agg(t.lang, t.planes)            FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS planes,
    jsonb_object_agg(t.lang, t.senses)            FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS senses,
    jsonb_object_agg(t.lang, t.traits)            FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS traits,
    jsonb_object_agg(t.lang, t.actions)           FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS actions,
    jsonb_object_agg(t.lang, t.bonus_actions)     FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS bonus_actions,
    jsonb_object_agg(t.lang, t.legendary_actions) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS legendary_actions,
    jsonb_object_agg(t.lang, t.reactions)         FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS reactions
  FROM filtered f
  LEFT JOIN public.creature_translations t ON t.creature_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  cmp.name                                    AS campaign_name,
  f.alignment,
  f.habitats,
  f.size,
  f.treasures,
  f.type,
  f.ac,
  f.cr,
  f.hp,
  f.hp_formula,
  f.speed_burrow,
  f.speed_climb,
  f.speed_fly,
  f.speed_swim,
  f.speed_walk,
  f.ability_cha,
  f.ability_con,
  f.ability_dex,
  f.ability_int,
  f.ability_str,
  f.ability_wis,
  f.initiative,
  f.passive_perception,
  f.ability_proficiencies,
  f.skill_proficiencies,
  f.skill_expertise,
  f.damage_immunities,
  f.damage_resistances,
  f.damage_vulnerabilities,
  f.condition_immunities,
  f.condition_resistances,
  f.condition_vulnerabilities,
  coalesce(tt.name, '{}'::jsonb)              AS name,
  coalesce(tt.page, '{}'::jsonb)              AS page,
  coalesce(tt.gear, '{}'::jsonb)              AS gear,
  coalesce(tt.languages, '{}'::jsonb)         AS languages,
  coalesce(tt.planes, '{}'::jsonb)            AS planes,
  coalesce(tt.senses, '{}'::jsonb)            AS senses,
  coalesce(tt.traits, '{}'::jsonb)            AS traits,
  coalesce(tt.actions, '{}'::jsonb)           AS actions,
  coalesce(tt.bonus_actions, '{}'::jsonb)     AS bonus_actions,
  coalesce(tt.legendary_actions, '{}'::jsonb) AS legendary_actions,
  coalesce(tt.reactions, '{}'::jsonb)         AS reactions,
  f.visibility
FROM filtered f
JOIN public.campaigns cmp ON cmp.id = f.campaign_id
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

-- Convert existing speeds from squares to centimeters (1 square = 150 cm).
update "public"."creatures"
set
  "speed_walk" = "speed_walk" * 150,
  "speed_fly" = "speed_fly" * 150,
  "speed_swim" = "speed_swim" * 150,
  "speed_climb" = "speed_climb" * 150,
  "speed_burrow" = "speed_burrow" * 150;

