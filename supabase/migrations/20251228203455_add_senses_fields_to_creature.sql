DROP FUNCTION public.fetch_creature(p_id uuid);
DROP FUNCTION public.fetch_creatures(uuid, text[], jsonb, text, text);

drop type "public"."creature_row";
create type "public"."creature_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "ac" smallint, "ability_cha" smallint, "ability_con" smallint, "ability_dex" smallint, "ability_int" smallint, "ability_str" smallint, "ability_wis" smallint, "ability_proficiencies" public.creature_ability[], "alignment" public.creature_alignment, "blindsight" integer, "condition_immunities" public.creature_condition[], "condition_resistances" public.creature_condition[], "condition_vulnerabilities" public.creature_condition[], "cr" numeric, "darkvision" integer, "damage_immunities" public.damage_type[], "damage_resistances" public.damage_type[], "damage_vulnerabilities" public.damage_type[], "habitats" public.creature_habitat[], "hp" smallint, "hp_formula" text, "initiative" smallint, "passive_perception" smallint, "size" public.creature_size, "skill_expertise" public.creature_skill[], "skill_proficiencies" public.creature_skill[], "speed_burrow" integer, "speed_climb" integer, "speed_fly" integer, "speed_swim" integer, "speed_walk" integer, "treasures" public.creature_treasure[], "tremorsense" integer, "truesight" integer, "type" public.creature_type, "actions" jsonb, "bonus_actions" jsonb, "gear" jsonb, "languages" jsonb, "legendary_actions" jsonb, "planes" jsonb, "reactions" jsonb, "senses" jsonb, "traits" jsonb);

alter table "public"."creatures" add column "blindsight" integer not null default 0;

alter table "public"."creatures" add column "darkvision" integer not null default 0;

alter table "public"."creatures" add column "tremorsense" integer not null default 0;

alter table "public"."creatures" add column "truesight" integer not null default 0;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_creature(p_campaign_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.creatures%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.creatures, p_creature);

  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_creature || jsonb_build_object('kind', 'creature'::public.resource_kind),
    p_creature_translation
  );

  INSERT INTO public.creatures (
    resource_id, type, alignment, size, habitats, treasures, cr, ac, hp, hp_formula,
    speed_walk, speed_fly, speed_swim, speed_climb, speed_burrow,
    ability_str, ability_dex, ability_con, ability_int, ability_wis, ability_cha,
    initiative, passive_perception, ability_proficiencies, skill_proficiencies, skill_expertise,
    damage_immunities, damage_resistances, damage_vulnerabilities,
    condition_immunities, condition_resistances, condition_vulnerabilities,
    blindsight, darkvision, tremorsense, truesight
  ) VALUES (
    v_id, r.type, r.alignment, r.size, r.habitats, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
    r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb, r.speed_burrow,
    r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
    r.initiative, r.passive_perception, r.ability_proficiencies, r.skill_proficiencies, r.skill_expertise,
    r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
    r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities,
    r.blindsight, r.darkvision, r.tremorsense, r.truesight
  );

  perform public.upsert_creature_translation(v_id, p_lang, p_creature_translation);

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_creature(p_id uuid)
 RETURNS public.creature_row
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
    c.ac,
    c.ability_cha,
    c.ability_con,
    c.ability_dex,
    c.ability_int,
    c.ability_str,
    c.ability_wis,
    c.ability_proficiencies,
    c.alignment,
    c.blindsight,
    c.condition_immunities,
    c.condition_resistances,
    c.condition_vulnerabilities,
    c.cr,
    c.darkvision,
    c.damage_immunities,
    c.damage_resistances,
    c.damage_vulnerabilities,
    c.habitats,
    c.hp,
    c.hp_formula,
    c.initiative,
    c.passive_perception,
    c.size,
    c.skill_expertise,
    c.skill_proficiencies,
    c.speed_burrow,
    c.speed_climb,
    c.speed_fly,
    c.speed_swim,
    c.speed_walk,
    c.treasures,
    c.tremorsense,
    c.truesight,
    c.type,
    coalesce(tt.actions, '{}'::jsonb) AS actions,
    coalesce(tt.bonus_actions, '{}'::jsonb) AS bonus_actions,
    coalesce(tt.gear, '{}'::jsonb) AS gear,
    coalesce(tt.languages, '{}'::jsonb) AS languages,
    coalesce(tt.legendary_actions, '{}'::jsonb) AS legendary_actions,
    coalesce(tt.planes, '{}'::jsonb) AS planes,
    coalesce(tt.reactions, '{}'::jsonb) AS reactions,
    coalesce(tt.senses, '{}'::jsonb) AS senses,
    coalesce(tt.traits, '{}'::jsonb) AS traits
  FROM public.fetch_resource(p_id) AS r
  JOIN public.creatures c ON c.resource_id = r.id
  LEFT JOIN (
    SELECT
      c.resource_id AS id,
      jsonb_object_agg(t.lang, t.gear)              AS gear,
      jsonb_object_agg(t.lang, t.languages)         AS languages,
      jsonb_object_agg(t.lang, t.planes)            AS planes,
      jsonb_object_agg(t.lang, t.senses)            AS senses,
      jsonb_object_agg(t.lang, t.traits)            AS traits,
      jsonb_object_agg(t.lang, t.actions)           AS actions,
      jsonb_object_agg(t.lang, t.bonus_actions)     AS bonus_actions,
      jsonb_object_agg(t.lang, t.reactions)         AS reactions,
      jsonb_object_agg(t.lang, t.legendary_actions) AS legendary_actions
    FROM public.creatures c
    LEFT JOIN public.creature_translations t ON t.resource_id = c.resource_id
    WHERE c.resource_id = p_id
    GROUP BY c.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.creature_row
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
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'creature'::public.resource_kind
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
    c.type,
    c.alignment,
    c.size,
    c.habitats,
    c.treasures,
    c.cr,
    c.ac,
    c.hp,
    c.hp_formula,
    c.speed_burrow,
    c.speed_walk,
    c.speed_fly,
    c.speed_swim,
    c.speed_climb,
    c.ability_str,
    c.ability_dex,
    c.ability_con,
    c.ability_int,
    c.ability_wis,
    c.ability_cha,
    c.initiative,
    c.passive_perception,
    c.ability_proficiencies,
    c.skill_proficiencies,
    c.skill_expertise,
    c.blindsight,
    c.darkvision,
    c.damage_immunities,
    c.damage_resistances,
    c.damage_vulnerabilities,
    c.condition_immunities,
    c.condition_resistances,
    c.condition_vulnerabilities,
    c.tremorsense,
    c.truesight
  FROM base b
  JOIN public.creatures c ON c.resource_id = b.id
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
  LEFT JOIN public.creature_translations t ON t.resource_id = f.id
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
  f.ac,
  f.ability_cha,
  f.ability_con,
  f.ability_dex,
  f.ability_int,
  f.ability_str,
  f.ability_wis,
  f.ability_proficiencies,
  f.alignment,
  f.blindsight,
  f.condition_immunities,
  f.condition_resistances,
  f.condition_vulnerabilities,
  f.cr,
  f.darkvision,
  f.damage_immunities,
  f.damage_resistances,
  f.damage_vulnerabilities,
  f.habitats,
  f.hp,
  f.hp_formula,
  f.initiative,
  f.passive_perception,
  f.size,
  f.skill_expertise,
  f.skill_proficiencies,
  f.speed_burrow,
  f.speed_climb,
  f.speed_fly,
  f.speed_swim,
  f.speed_walk,
  f.treasures,
  f.tremorsense,
  f.truesight,
  f.type,
  coalesce(tt.actions, '{}'::jsonb) AS actions,
  coalesce(tt.bonus_actions, '{}'::jsonb) AS bonus_actions,
  coalesce(tt.gear, '{}'::jsonb) AS gear,
  coalesce(tt.languages, '{}'::jsonb) AS languages,
  coalesce(tt.legendary_actions, '{}'::jsonb) AS legendary_actions,
  coalesce(tt.planes, '{}'::jsonb) AS planes,
  coalesce(tt.reactions, '{}'::jsonb) AS reactions,
  coalesce(tt.senses, '{}'::jsonb) AS senses,
  coalesce(tt.traits, '{}'::jsonb) AS traits
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

CREATE OR REPLACE FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb)
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
    p_creature || jsonb_build_object('kind', 'creature'::public.resource_kind),
    p_creature_translation
  );

  UPDATE public.creatures c
  SET (
    type, alignment, size, habitats, treasures, cr, ac, hp, hp_formula,
    speed_walk, speed_fly, speed_swim, speed_climb, speed_burrow,
    ability_str, ability_dex, ability_con, ability_int, ability_wis, ability_cha,
    initiative, passive_perception, ability_proficiencies, skill_proficiencies, skill_expertise,
    damage_immunities, damage_resistances, damage_vulnerabilities,
    condition_immunities, condition_resistances, condition_vulnerabilities,
    blindsight, darkvision, tremorsense, truesight
  ) = (
    SELECT r.type, r.alignment, r.size, r.habitats, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
      r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb, r.speed_burrow,
      r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
      r.initiative, r.passive_perception, r.ability_proficiencies, r.skill_proficiencies, r.skill_expertise,
      r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
      r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities,
      r.blindsight, r.darkvision, r.tremorsense, r.truesight
    FROM jsonb_populate_record(null::public.creatures, to_jsonb(c) || p_creature) as r
  )
  WHERE c.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_creature_translation(p_id, p_lang, p_creature_translation);
END;
$function$
;


