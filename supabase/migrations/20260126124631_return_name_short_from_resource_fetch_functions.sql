DROP FUNCTION public.fetch_armor(p_id uuid);
DROP FUNCTION public.fetch_armors(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

DROP FUNCTION public.fetch_item(p_id uuid);
DROP FUNCTION public.fetch_items(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

DROP FUNCTION public.fetch_tool(p_id uuid);
DROP FUNCTION public.fetch_tools(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

DROP FUNCTION public.fetch_weapon(p_id uuid);
DROP FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

DROP FUNCTION public.fetch_character_class(p_id uuid);
DROP FUNCTION public.fetch_character_classes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

DROP FUNCTION public.fetch_creature(p_id uuid);
DROP FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

DROP FUNCTION public.fetch_creature_tag(p_id uuid);
DROP FUNCTION public.fetch_creature_tags(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

DROP FUNCTION public.fetch_eldritch_invocation(p_id uuid);
DROP FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

DROP FUNCTION public.fetch_equipment(p_id uuid);
DROP FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);


DROP FUNCTION public.fetch_language(p_id uuid);
DROP FUNCTION public.fetch_languages(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

DROP FUNCTION public.fetch_plane(p_id uuid);
DROP FUNCTION public.fetch_planes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

DROP FUNCTION public.fetch_spell(p_id uuid);
DROP FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);


drop type "public"."armor_row";

drop type "public"."character_class_row";

drop type "public"."creature_row";

drop type "public"."creature_tag_row";

drop type "public"."eldritch_invocation_row";

drop type "public"."equipment_row";

drop type "public"."item_row";

drop type "public"."language_row";

drop type "public"."plane_row";

drop type "public"."spell_row";

drop type "public"."tool_row";

drop type "public"."weapon_row";

create type "public"."armor_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "armor_class_max_cha_modifier" smallint, "armor_class_max_con_modifier" smallint, "armor_class_max_dex_modifier" smallint, "armor_class_max_int_modifier" smallint, "armor_class_max_str_modifier" smallint, "armor_class_max_wis_modifier" smallint, "armor_class_modifier" smallint, "base_armor_class" smallint, "disadvantage_on_stealth" boolean, "required_cha" smallint, "required_con" smallint, "required_dex" smallint, "required_int" smallint, "required_str" smallint, "required_wis" smallint, "type" public.armor_type, "notes" jsonb);

create type "public"."character_class_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb, "armor_proficiencies" public.armor_type[], "hp_die" public.die_type, "primary_abilities" public.creature_ability[], "saving_throw_proficiencies" public.creature_ability[], "skill_proficiencies_pool" public.creature_skill[], "skill_proficiencies_pool_quantity" smallint, "starting_equipment_entries" jsonb, "tool_proficiency_ids" uuid[], "weapon_proficiencies" public.weapon_type[], "spell_ids" uuid[], "armor_proficiencies_extra" jsonb, "weapon_proficiencies_extra" jsonb);

create type "public"."creature_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb, "ac" smallint, "ability_cha" smallint, "ability_con" smallint, "ability_dex" smallint, "ability_int" smallint, "ability_str" smallint, "ability_wis" smallint, "ability_proficiencies" public.creature_ability[], "alignment" public.creature_alignment, "blindsight" integer, "condition_immunities" public.creature_condition[], "condition_resistances" public.creature_condition[], "condition_vulnerabilities" public.creature_condition[], "cr" numeric, "darkvision" integer, "damage_immunities" public.damage_type[], "damage_resistances" public.damage_type[], "damage_vulnerabilities" public.damage_type[], "habitats" public.creature_habitat[], "hp" smallint, "hp_formula" text, "initiative" smallint, "language_additional_count" smallint, "passive_perception" smallint, "size" public.creature_size, "skill_expertise" public.creature_skill[], "skill_proficiencies" public.creature_skill[], "speed_burrow" integer, "speed_climb" integer, "speed_fly" integer, "speed_swim" integer, "speed_walk" integer, "treasures" public.creature_treasure[], "equipment_entries" jsonb, "language_ids" uuid[], "language_scope" public.language_scope, "tag_ids" uuid[], "plane_ids" uuid[], "telepathy_range" integer, "tremorsense" integer, "truesight" integer, "type" public.creature_type, "actions" jsonb, "bonus_actions" jsonb, "gear" jsonb, "legendary_actions" jsonb, "reactions" jsonb, "traits" jsonb);

create type "public"."creature_tag_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb);

create type "public"."eldritch_invocation_row" as ("id" uuid, "campaign_id" uuid, "campaign_name" text, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb, "min_warlock_level" smallint, "description" jsonb, "prerequisite" jsonb);

create type "public"."equipment_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "notes" jsonb);

create type "public"."item_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "type" public.item_type, "notes" jsonb);

create type "public"."language_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb, "rarity" public.language_rarity, "origin" jsonb);

create type "public"."plane_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb, "category" public.plane_category, "alignments" public.creature_alignment[]);

create type "public"."spell_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb, "casting_time" public.spell_casting_time, "casting_time_value" integer, "character_class_ids" uuid[], "concentration" boolean, "duration" public.spell_duration, "duration_value" integer, "level" smallint, "material" boolean, "range" public.spell_range, "range_value" integer, "ritual" boolean, "school" public.spell_school, "somatic" boolean, "verbal" boolean, "description" jsonb, "materials" jsonb, "upgrade" jsonb);

create type "public"."tool_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "notes" jsonb, "ability" public.creature_ability, "craft_ids" uuid[], "type" public.tool_type, "utilize" jsonb);

create type "public"."weapon_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "damage" text, "damage_type" public.damage_type, "damage_versatile" text, "mastery" public.weapon_mastery, "melee" boolean, "properties" public.weapon_property[], "range_long" integer, "range_short" integer, "ranged" boolean, "type" public.weapon_type, "ammunition_ids" uuid[], "notes" jsonb);

CREATE OR REPLACE FUNCTION public.fetch_character_class(p_id uuid)
 RETURNS public.character_class_row
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
    r.name_short,
    r.page,
    c.armor_proficiencies,
    c.hp_die,
    c.primary_abilities,
    c.saving_throw_proficiencies,
    c.skill_proficiencies_pool,
    c.skill_proficiencies_pool_quantity,
    coalesce(se.starting_equipment_entries, '[]'::jsonb) AS starting_equipment_entries,
    coalesce(tp.tool_proficiency_ids, '{}'::uuid[]) AS tool_proficiency_ids,
    c.weapon_proficiencies,
    coalesce(s.spell_ids, '{}'::uuid[]) AS spell_ids,
    coalesce(tt.armor_proficiencies_extra, '{}'::jsonb) AS armor_proficiencies_extra,
    coalesce(tt.weapon_proficiencies_extra, '{}'::jsonb) AS weapon_proficiencies_extra
  FROM public.fetch_resource(p_id) AS r
  JOIN public.character_classes c ON c.resource_id = r.id
  LEFT JOIN (
    SELECT
      cs.character_class_id AS id,
      array_agg(cs.spell_id ORDER BY cs.spell_id) AS spell_ids
    FROM public.character_class_spells cs
    WHERE cs.character_class_id = p_id
    GROUP BY cs.character_class_id
  ) s ON s.id = r.id
  LEFT JOIN (
    SELECT
      ct.character_class_id AS id,
      array_agg(ct.tool_id ORDER BY ct.tool_id) AS tool_proficiency_ids
    FROM public.character_class_tool_proficiencies ct
    WHERE ct.character_class_id = p_id
    GROUP BY ct.character_class_id
  ) tp ON tp.id = r.id
  LEFT JOIN (
    SELECT
      se.character_class_id AS id,
      jsonb_agg(
        jsonb_build_object(
          'choice_group', se.choice_group,
          'choice_option', se.choice_option,
          'equipment_id', se.equipment_id,
          'quantity', se.quantity
        )
        ORDER BY se.choice_group, se.choice_option, se.id
      ) AS starting_equipment_entries
    FROM public.character_class_starting_equipment se
    WHERE se.character_class_id = p_id
    GROUP BY se.character_class_id
  ) se ON se.id = r.id
  LEFT JOIN (
    SELECT
      c.resource_id AS id,
      jsonb_object_agg(t.lang, t.armor_proficiencies_extra) AS armor_proficiencies_extra,
      jsonb_object_agg(t.lang, t.weapon_proficiencies_extra) AS weapon_proficiencies_extra
    FROM public.character_classes c
    LEFT JOIN public.character_class_translations t ON t.resource_id = c.resource_id
    WHERE c.resource_id = p_id
    GROUP BY c.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_character_classes(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.character_class_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'character_class'::public.resource_kind
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
    c.armor_proficiencies,
    c.hp_die,
    c.primary_abilities,
    c.saving_throw_proficiencies,
    c.skill_proficiencies_pool,
    c.skill_proficiencies_pool_quantity,
    c.weapon_proficiencies
  FROM base b
  JOIN public.character_classes c ON c.resource_id = b.id
),
spells AS (
  SELECT
    cs.character_class_id AS id,
    array_agg(cs.spell_id ORDER BY cs.spell_id) AS spell_ids
  FROM public.character_class_spells cs
  GROUP BY cs.character_class_id
),
tools AS (
  SELECT
    ct.character_class_id AS id,
    array_agg(ct.tool_id ORDER BY ct.tool_id) AS tool_proficiency_ids
  FROM public.character_class_tool_proficiencies ct
  GROUP BY ct.character_class_id
),
tse AS (
  SELECT
    se.character_class_id AS id,
    jsonb_agg(
      jsonb_build_object(
        'choice_group', se.choice_group,
        'choice_option', se.choice_option,
        'equipment_id', se.equipment_id,
        'quantity', se.quantity
      )
      ORDER BY se.choice_group, se.choice_option, se.id
    ) AS starting_equipment_entries
  FROM public.character_class_starting_equipment se
  GROUP BY se.character_class_id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.armor_proficiencies_extra) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS armor_proficiencies_extra,
    jsonb_object_agg(t.lang, t.weapon_proficiencies_extra) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS weapon_proficiencies_extra
  FROM src s
  LEFT JOIN public.character_class_translations t ON t.resource_id = s.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY s.id
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.name_short,
  s.page,
  s.armor_proficiencies,
  s.hp_die,
  s.primary_abilities,
  s.saving_throw_proficiencies,
  s.skill_proficiencies_pool,
  s.skill_proficiencies_pool_quantity,
  coalesce(tse.starting_equipment_entries, '[]'::jsonb) AS starting_equipment_entries,
  coalesce(tools.tool_proficiency_ids, '{}'::uuid[]) AS tool_proficiency_ids,
  s.weapon_proficiencies,
  coalesce(sp.spell_ids, '{}'::uuid[]) AS spell_ids,
  coalesce(tt.armor_proficiencies_extra, '{}'::jsonb) AS armor_proficiencies_extra,
  coalesce(tt.weapon_proficiencies_extra, '{}'::jsonb) AS weapon_proficiencies_extra
FROM src s
LEFT JOIN spells sp ON sp.id = s.id
LEFT JOIN tools ON tools.id = s.id
LEFT JOIN tse ON tse.id = s.id
LEFT JOIN t tt ON tt.id = s.id
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
    r.name_short,
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
    c.language_additional_count,
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
    coalesce(eq.equipment_entries, '[]'::jsonb) AS equipment_entries,
    coalesce(cl.language_ids, '{}'::uuid[]) AS language_ids,
    c.language_scope,
    coalesce(ct.tag_ids, '{}'::uuid[]) AS tag_ids,
    coalesce(cp.plane_ids, '{}'::uuid[]) AS plane_ids,
    c.telepathy_range,
    c.tremorsense,
    c.truesight,
    c.type,
    coalesce(tt.actions, '{}'::jsonb) AS actions,
    coalesce(tt.bonus_actions, '{}'::jsonb) AS bonus_actions,
    coalesce(tt.gear, '{}'::jsonb) AS gear,
    coalesce(tt.legendary_actions, '{}'::jsonb) AS legendary_actions,
    coalesce(tt.reactions, '{}'::jsonb) AS reactions,
    coalesce(tt.traits, '{}'::jsonb) AS traits
  FROM public.fetch_resource(p_id) AS r
  JOIN public.creatures c ON c.resource_id = r.id
  LEFT JOIN (
    SELECT
      c.resource_id AS id,
      jsonb_object_agg(t.lang, t.gear)              AS gear,
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
  LEFT JOIN (
    SELECT
      cl.creature_id AS id,
      array_agg(cl.language_id ORDER BY cl.language_id) AS language_ids
    FROM public.creature_languages cl
    WHERE cl.creature_id = p_id
    GROUP BY cl.creature_id
  ) cl ON cl.id = r.id
  LEFT JOIN (
    SELECT
      cp.creature_id AS id,
      array_agg(cp.plane_id ORDER BY cp.plane_id) AS plane_ids
    FROM public.creature_planes cp
    WHERE cp.creature_id = p_id
    GROUP BY cp.creature_id
  ) cp ON cp.id = r.id
  LEFT JOIN (
    SELECT
      cct.creature_id AS id,
      array_agg(cct.creature_tag_id ORDER BY cct.creature_tag_id) AS tag_ids
    FROM public.creature_creature_tags cct
    WHERE cct.creature_id = p_id
    GROUP BY cct.creature_id
  ) ct ON ct.id = r.id
  LEFT JOIN (
    SELECT
      ce.creature_id AS id,
      jsonb_agg(
        jsonb_build_object(
          'equipment_id', ce.equipment_id,
          'quantity', ce.quantity
        )
        ORDER BY ce.id
      ) AS equipment_entries
    FROM public.creature_equipment ce
    WHERE ce.creature_id = p_id
    GROUP BY ce.creature_id
  ) eq ON eq.id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_creature_tag(p_id uuid)
 RETURNS public.creature_tag_row
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
    r.name_short,
    r.page
  FROM public.fetch_resource(p_id) AS r
  JOIN public.creature_tags ct ON ct.resource_id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_creature_tags(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.creature_tag_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'creature_tag'::public.resource_kind
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
    b.page
  FROM base b
  JOIN public.creature_tags ct ON ct.resource_id = b.id
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.name_short,
  s.page
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
    b.name_short,
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
    c.language_additional_count,
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
    c.language_scope,
    c.telepathy_range,
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
    jsonb_object_agg(t.lang, t.traits)            FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS traits,
    jsonb_object_agg(t.lang, t.actions)           FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS actions,
    jsonb_object_agg(t.lang, t.bonus_actions)     FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS bonus_actions,
    jsonb_object_agg(t.lang, t.legendary_actions) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS legendary_actions,
    jsonb_object_agg(t.lang, t.reactions)         FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS reactions
  FROM filtered f
  LEFT JOIN public.creature_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
),
cl AS (
  SELECT
    cl.creature_id AS id,
    array_agg(cl.language_id ORDER BY cl.language_id) AS language_ids
  FROM public.creature_languages cl
  GROUP BY cl.creature_id
),
cp AS (
  SELECT
    cp.creature_id AS id,
    array_agg(cp.plane_id ORDER BY cp.plane_id) AS plane_ids
  FROM public.creature_planes cp
  GROUP BY cp.creature_id
),
ct AS (
  SELECT
    cct.creature_id AS id,
    array_agg(cct.creature_tag_id ORDER BY cct.creature_tag_id) AS tag_ids
  FROM public.creature_creature_tags cct
  GROUP BY cct.creature_id
),
eq AS (
  SELECT
    ce.creature_id AS id,
    jsonb_agg(
      jsonb_build_object(
        'equipment_id', ce.equipment_id,
        'quantity', ce.quantity
      )
      ORDER BY ce.id
    ) AS equipment_entries
  FROM public.creature_equipment ce
  GROUP BY ce.creature_id
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
  f.language_additional_count,
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
  coalesce(eq.equipment_entries, '[]'::jsonb) AS equipment_entries,
  coalesce(cl.language_ids, '{}'::uuid[]) AS language_ids,
  f.language_scope,
  coalesce(ct.tag_ids, '{}'::uuid[]) AS tag_ids,
  coalesce(cp.plane_ids, '{}'::uuid[]) AS plane_ids,
  f.telepathy_range,
  f.tremorsense,
  f.truesight,
  f.type,
  coalesce(tt.actions, '{}'::jsonb) AS actions,
  coalesce(tt.bonus_actions, '{}'::jsonb) AS bonus_actions,
  coalesce(tt.gear, '{}'::jsonb) AS gear,
  coalesce(tt.legendary_actions, '{}'::jsonb) AS legendary_actions,
  coalesce(tt.reactions, '{}'::jsonb) AS reactions,
  coalesce(tt.traits, '{}'::jsonb) AS traits
FROM filtered f
LEFT JOIN t tt ON tt.id = f.id
LEFT JOIN eq ON eq.id = f.id
LEFT JOIN cl ON cl.id = f.id
LEFT JOIN ct ON ct.id = f.id
LEFT JOIN cp ON cp.id = f.id
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

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocation(p_id uuid)
 RETURNS public.eldritch_invocation_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    r.id,
    r.campaign_id,
    r.campaign_name,
    r.kind,
    r.visibility,
    r.name,
    r.name_short,
    r.page,
    ei.min_warlock_level,
    coalesce(tt.description, '{}'::jsonb)  AS description,
    coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite
  FROM public.fetch_resource(p_id) AS r
  JOIN public.eldritch_invocations ei ON ei.resource_id = r.id
  LEFT JOIN (
    SELECT
      ei.resource_id AS id,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description)  AS description
    FROM public.eldritch_invocations ei
    LEFT JOIN public.eldritch_invocation_translations t ON t.resource_id = ei.resource_id
    WHERE ei.resource_id = p_id
    GROUP BY ei.resource_id
  ) tt ON tt.id = r.id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.eldritch_invocation_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT coalesce((p_filters->>'warlock_level')::int, 20) AS warlock_level
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'eldritch_invocation'::public.resource_kind
),
eldritch AS (
  SELECT b.*, e.min_warlock_level
  FROM base b
  JOIN public.eldritch_invocations e ON e.resource_id = b.id
),
filtered AS (
  SELECT e.*
  FROM eldritch e, prefs p
  WHERE e.min_warlock_level <= p.warlock_level
),
et AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.eldritch_invocation_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  f.campaign_name,
  f.kind,
  f.visibility,
  f.name,
  f.name_short,
  f.page,
  f.min_warlock_level,
  coalesce(et.description, '{}'::jsonb)  AS description,
  coalesce(et.prerequisite, '{}'::jsonb) AS prerequisite
FROM filtered f
LEFT JOIN et ON et.id = f.id
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
    r.name_short,
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
      FROM jsonb_each_text(p_filters->'rarities') AS e(key, value)
      WHERE e.value = 'true'
    ) AS rarity_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.equipment_rarity), null)
      FROM jsonb_each_text(p_filters->'rarities') AS e(key, value)
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
    b.name_short,
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
  f.name_short,
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

CREATE OR REPLACE FUNCTION public.fetch_language(p_id uuid)
 RETURNS public.language_row
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
    r.name_short,
    r.page,
    l.rarity,
    coalesce(tt.origin, '{}'::jsonb) AS origin
  FROM public.fetch_resource(p_id) AS r
  JOIN public.languages l ON l.resource_id = r.id
  LEFT JOIN (
    SELECT
      l.resource_id AS id,
      jsonb_object_agg(t.lang, t.origin) AS origin
    FROM public.languages l
    LEFT JOIN public.language_translations t ON t.resource_id = l.resource_id
    WHERE l.resource_id = p_id
    GROUP BY l.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_languages(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.language_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'language'::public.resource_kind
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
    l.rarity
  FROM base b
  JOIN public.languages l ON l.resource_id = b.id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.origin) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS origin
  FROM src s
  LEFT JOIN public.language_translations t ON t.resource_id = s.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY s.id
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.name_short,
  s.page,
  s.rarity,
  coalesce(tt.origin, '{}'::jsonb) AS origin
FROM src s
LEFT JOIN t tt ON tt.id = s.id
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

CREATE OR REPLACE FUNCTION public.fetch_plane(p_id uuid)
 RETURNS public.plane_row
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
    r.name_short,
    r.page,
    p.category,
    p.alignments
  FROM public.fetch_resource(p_id) AS r
  JOIN public.planes p ON p.resource_id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_planes(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.plane_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    (
      SELECT coalesce(array_agg(lower(e.key)::public.plane_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'true'
    ) AS categories_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.plane_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'false'
    ) AS categories_exc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_alignment), null)
      FROM jsonb_each_text(p_filters->'alignments') AS e(key, value)
      WHERE e.value = 'true'
    ) AS alignments_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_alignment), null)
      FROM jsonb_each_text(p_filters->'alignments') AS e(key, value)
      WHERE e.value = 'false'
    ) AS alignments_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'plane'::public.resource_kind
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
    p.category,
    p.alignments
  FROM base b
  JOIN public.planes p ON p.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    (p.categories_inc IS NULL OR s.category = any(p.categories_inc))
    AND (p.categories_exc IS NULL OR NOT (s.category = any(p.categories_exc)))
    AND (p.alignments_inc IS NULL OR s.alignments && p.alignments_inc)
    AND (p.alignments_exc IS NULL OR NOT (s.alignments && p.alignments_exc))
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
  f.category,
  f.alignments
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

CREATE OR REPLACE FUNCTION public.fetch_spell(p_id uuid)
 RETURNS public.spell_row
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.spell_row
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
  f.campaign_id,
  f.campaign_name,
  f.id,
  f.kind,
  f.visibility,
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
    e.name_short,
    e.page,
    e.cost,
    e.magic,
    e.rarity,
    e.weight,
    i.type,
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
WITH prefs AS (
  SELECT
    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.item_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.item_type), null)
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
    b.name_short,
    b.page,
    b.cost,
    b.magic,
    b.rarity,
    b.weight,
    i.type,
    b.notes
  FROM base b
  JOIN public.items i ON i.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.name_short,
  s.page,
  s.cost,
  s.magic,
  s.rarity,
  s.weight,
  s.type,
  s.notes
FROM filtered s
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
    e.name_short,
    e.page,
    e.cost,
    e.magic,
    e.rarity,
    e.weight,
    e.notes,
    t.ability,
    coalesce(tc.craft_ids, '{}'::uuid[]) AS craft_ids,
    t.type,
    coalesce(tt.utilize, '{}'::jsonb) AS utilize
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.tools t ON t.resource_id = e.id
  LEFT JOIN (
    SELECT
      tc.tool_id AS id,
      array_agg(tc.equipment_id ORDER BY tc.equipment_id) AS craft_ids
    FROM public.tool_crafts tc
    WHERE tc.tool_id = p_id
    GROUP BY tc.tool_id
  ) tc ON tc.id = e.id
  LEFT JOIN (
    SELECT
      t.resource_id AS id,
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
    b.name_short,
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
    jsonb_object_agg(t.lang, t.utilize) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS utilize
  FROM filtered f
  LEFT JOIN public.tool_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
),
tc AS (
  SELECT
    tc.tool_id AS id,
    array_agg(tc.equipment_id ORDER BY tc.equipment_id) AS craft_ids
  FROM public.tool_crafts tc
  GROUP BY tc.tool_id
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
  f.cost,
  f.magic,
  f.rarity,
  f.weight,
  f.notes,
  f.ability,
  coalesce(tc.craft_ids, '{}'::uuid[]) AS craft_ids,
  f.type,
  coalesce(tt.utilize, '{}'::jsonb) AS utilize
FROM filtered f
LEFT JOIN tt ON tt.id = f.id
LEFT JOIN tc ON tc.id = f.id
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
    e.name_short,
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
    coalesce(wa.ammunition_ids, '{}'::uuid[])  AS ammunition_ids,
    e.notes
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.weapons w ON w.resource_id = e.id
  LEFT JOIN (
    SELECT
      wa.weapon_id AS id,
      array_agg(wa.equipment_id ORDER BY wa.equipment_id) AS ammunition_ids
    FROM public.weapon_ammunitions wa
    WHERE wa.weapon_id = p_id
    GROUP BY wa.weapon_id
  ) wa ON wa.id = e.id
  LEFT JOIN (
    SELECT
      w.resource_id AS id
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
    b.name_short,
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
    f.id
  FROM filtered f
  LEFT JOIN public.weapon_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
),
wa AS (
  SELECT
    wa.weapon_id AS id,
    array_agg(wa.equipment_id ORDER BY wa.equipment_id) AS ammunition_ids
  FROM public.weapon_ammunitions wa
  GROUP BY wa.weapon_id
)
SELECT
  f.campaign_id,
  f.campaign_name,
  f.id,
  f.kind,
  f.visibility,
  f.name                          AS name,
  f.name_short                    AS name_short,
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
  coalesce(wa.ammunition_ids, '{}'::uuid[])  AS ammunition_ids,
  f.notes                        AS notes
FROM filtered f
LEFT JOIN t tt ON tt.id = f.id
LEFT JOIN wa ON wa.id = f.id
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
