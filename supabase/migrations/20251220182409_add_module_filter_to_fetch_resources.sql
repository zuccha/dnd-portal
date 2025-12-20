set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.campaign_resource_ids(p_campaign_id uuid, p_include_modules boolean DEFAULT false)
 RETURNS TABLE(id uuid)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT p_campaign_id AS id
  UNION
  SELECT cm.module_id
  FROM public.campaign_modules cm
  WHERE p_include_modules
    AND cm.campaign_id = p_campaign_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, alignment public.creature_alignment, habitats public.creature_habitat[], size public.creature_size, treasures public.creature_treasure[], type public.creature_type, ac text, cr numeric, hp text, hp_formula text, speed_burrow text, speed_climb text, speed_fly text, speed_swim text, speed_walk text, ability_cha smallint, ability_con smallint, ability_dex smallint, ability_int smallint, ability_str smallint, ability_wis smallint, initiative text, initiative_passive text, passive_perception text, ability_proficiencies public.creature_ability[], skill_proficiencies public.creature_skill[], skill_expertise public.creature_skill[], damage_immunities public.damage_type[], damage_resistances public.damage_type[], damage_vulnerabilities public.damage_type[], condition_immunities public.creature_condition[], condition_resistances public.creature_condition[], condition_vulnerabilities public.creature_condition[], name jsonb, page jsonb, gear jsonb, languages jsonb, planes jsonb, senses jsonb, traits jsonb, actions jsonb, bonus_actions jsonb, legendary_actions jsonb, reactions jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    -- include modules
    coalesce((p_filters->>'include_modules')::boolean, false) AS include_modules,

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
  JOIN public.campaign_resource_ids(p_campaign_id, p.include_modules) ci ON ci.id = c.campaign_id
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
  f.initiative_passive,
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

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, min_warlock_level smallint, name jsonb, prerequisite jsonb, description jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    coalesce((p_filters->>'include_modules')::boolean, false) AS include_modules,
    coalesce((p_filters->>'warlock_level')::int, 20) AS warlock_level
),
src AS (
  SELECT e.*
  FROM public.eldritch_invocations e
  JOIN prefs p ON true
  JOIN public.campaign_resource_ids(p_campaign_id, p.include_modules) ci ON ci.id = e.campaign_id
  JOIN public.campaigns c ON c.id = e.campaign_id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE s.min_warlock_level <= p.warlock_level
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                 AS name,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.eldritch_invocation_translations t ON t.eldritch_invocation_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  c.name                                  AS campaign_name,
  f.min_warlock_level,
  coalesce(tt.name,         '{}'::jsonb)  AS name,
  coalesce(tt.prerequisite, '{}'::jsonb)  AS prerequisite,
  coalesce(tt.description,  '{}'::jsonb)  AS description,
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

CREATE OR REPLACE FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, level smallint, character_classes public.character_class[], school public.spell_school, casting_time public.spell_casting_time, casting_time_value text, duration public.spell_duration, duration_value text, range public.spell_range, range_value_imp text, range_value_met text, concentration boolean, ritual boolean, somatic boolean, verbal boolean, material boolean, name jsonb, description jsonb, materials jsonb, page jsonb, upgrade jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    -- include modules
    coalesce((p_filters->>'include_modules')::boolean, false) AS include_modules,

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
  JOIN public.campaign_resource_ids(p_campaign_id, p.include_modules) ci ON ci.id = s.campaign_id
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
  f.duration,
  f.duration_value,
  f.range,
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

CREATE OR REPLACE FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, type public.weapon_type, damage text, damage_type public.damage_type, damage_versatile text, mastery public.weapon_mastery, properties public.weapon_property[], magic boolean, melee boolean, ranged boolean, range_ft_long real, range_ft_short real, range_m_long real, range_m_short real, weight_kg real, weight_lb real, cost real, name jsonb, notes jsonb, page jsonb, ammunition jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    -- include modules
    coalesce((p_filters->>'include_modules')::boolean, false) AS include_modules,

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
  JOIN prefs p ON true
  JOIN public.campaign_resource_ids(p_campaign_id, p.include_modules) ci ON ci.id = w.campaign_id
  JOIN public.campaigns c ON c.id = w.campaign_id
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


