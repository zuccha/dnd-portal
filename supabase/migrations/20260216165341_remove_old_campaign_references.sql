drop trigger if exists "enforce_campaign_module_is_module" on "public"."campaign_modules";

drop trigger if exists "enforce_module_dependency_is_module" on "public"."module_dependencies";

drop trigger if exists "enforce_user_module_is_module" on "public"."user_modules";

drop policy "DMs can add modules to campaigns" on "public"."campaign_modules";

drop policy "DMs can remove modules from campaigns" on "public"."campaign_modules";

drop policy "Players can view modules used by campaigns they joined" on "public"."campaign_modules";

drop policy "Campaign creators can manage memberships" on "public"."campaign_players";

drop policy "Users can view their campaign memberships" on "public"."campaign_players";

drop policy "Anon can read public/purchasable modules" on "public"."campaigns";

drop policy "Campaign creators can edit" on "public"."campaigns";

drop policy "Users can read campaigns and modules" on "public"."campaigns";

drop policy "Module creators can add dependencies" on "public"."module_dependencies";

drop policy "Module creators can remove dependencies" on "public"."module_dependencies";

drop policy "Users can read module dependencies" on "public"."module_dependencies";

drop policy "Module creators can manage ownership" on "public"."user_modules";

drop policy "Users can view their own module ownership" on "public"."user_modules";

revoke delete on table "public"."campaign_modules" from "anon";

revoke insert on table "public"."campaign_modules" from "anon";

revoke references on table "public"."campaign_modules" from "anon";

revoke select on table "public"."campaign_modules" from "anon";

revoke trigger on table "public"."campaign_modules" from "anon";

revoke truncate on table "public"."campaign_modules" from "anon";

revoke update on table "public"."campaign_modules" from "anon";

revoke delete on table "public"."campaign_modules" from "authenticated";

revoke insert on table "public"."campaign_modules" from "authenticated";

revoke references on table "public"."campaign_modules" from "authenticated";

revoke select on table "public"."campaign_modules" from "authenticated";

revoke trigger on table "public"."campaign_modules" from "authenticated";

revoke truncate on table "public"."campaign_modules" from "authenticated";

revoke update on table "public"."campaign_modules" from "authenticated";

revoke delete on table "public"."campaign_modules" from "service_role";

revoke insert on table "public"."campaign_modules" from "service_role";

revoke references on table "public"."campaign_modules" from "service_role";

revoke select on table "public"."campaign_modules" from "service_role";

revoke trigger on table "public"."campaign_modules" from "service_role";

revoke truncate on table "public"."campaign_modules" from "service_role";

revoke update on table "public"."campaign_modules" from "service_role";

revoke delete on table "public"."campaign_players" from "anon";

revoke insert on table "public"."campaign_players" from "anon";

revoke references on table "public"."campaign_players" from "anon";

revoke select on table "public"."campaign_players" from "anon";

revoke trigger on table "public"."campaign_players" from "anon";

revoke truncate on table "public"."campaign_players" from "anon";

revoke update on table "public"."campaign_players" from "anon";

revoke delete on table "public"."campaign_players" from "authenticated";

revoke insert on table "public"."campaign_players" from "authenticated";

revoke references on table "public"."campaign_players" from "authenticated";

revoke select on table "public"."campaign_players" from "authenticated";

revoke trigger on table "public"."campaign_players" from "authenticated";

revoke truncate on table "public"."campaign_players" from "authenticated";

revoke update on table "public"."campaign_players" from "authenticated";

revoke delete on table "public"."campaign_players" from "service_role";

revoke insert on table "public"."campaign_players" from "service_role";

revoke references on table "public"."campaign_players" from "service_role";

revoke select on table "public"."campaign_players" from "service_role";

revoke trigger on table "public"."campaign_players" from "service_role";

revoke truncate on table "public"."campaign_players" from "service_role";

revoke update on table "public"."campaign_players" from "service_role";

revoke delete on table "public"."campaigns" from "anon";

revoke insert on table "public"."campaigns" from "anon";

revoke references on table "public"."campaigns" from "anon";

revoke select on table "public"."campaigns" from "anon";

revoke trigger on table "public"."campaigns" from "anon";

revoke truncate on table "public"."campaigns" from "anon";

revoke update on table "public"."campaigns" from "anon";

revoke delete on table "public"."campaigns" from "authenticated";

revoke insert on table "public"."campaigns" from "authenticated";

revoke references on table "public"."campaigns" from "authenticated";

revoke select on table "public"."campaigns" from "authenticated";

revoke trigger on table "public"."campaigns" from "authenticated";

revoke truncate on table "public"."campaigns" from "authenticated";

revoke update on table "public"."campaigns" from "authenticated";

revoke delete on table "public"."campaigns" from "service_role";

revoke insert on table "public"."campaigns" from "service_role";

revoke references on table "public"."campaigns" from "service_role";

revoke select on table "public"."campaigns" from "service_role";

revoke trigger on table "public"."campaigns" from "service_role";

revoke truncate on table "public"."campaigns" from "service_role";

revoke update on table "public"."campaigns" from "service_role";

revoke delete on table "public"."module_dependencies" from "anon";

revoke insert on table "public"."module_dependencies" from "anon";

revoke references on table "public"."module_dependencies" from "anon";

revoke select on table "public"."module_dependencies" from "anon";

revoke trigger on table "public"."module_dependencies" from "anon";

revoke truncate on table "public"."module_dependencies" from "anon";

revoke update on table "public"."module_dependencies" from "anon";

revoke delete on table "public"."module_dependencies" from "authenticated";

revoke insert on table "public"."module_dependencies" from "authenticated";

revoke references on table "public"."module_dependencies" from "authenticated";

revoke select on table "public"."module_dependencies" from "authenticated";

revoke trigger on table "public"."module_dependencies" from "authenticated";

revoke truncate on table "public"."module_dependencies" from "authenticated";

revoke update on table "public"."module_dependencies" from "authenticated";

revoke delete on table "public"."module_dependencies" from "service_role";

revoke insert on table "public"."module_dependencies" from "service_role";

revoke references on table "public"."module_dependencies" from "service_role";

revoke select on table "public"."module_dependencies" from "service_role";

revoke trigger on table "public"."module_dependencies" from "service_role";

revoke truncate on table "public"."module_dependencies" from "service_role";

revoke update on table "public"."module_dependencies" from "service_role";

revoke delete on table "public"."user_modules" from "anon";

revoke insert on table "public"."user_modules" from "anon";

revoke references on table "public"."user_modules" from "anon";

revoke select on table "public"."user_modules" from "anon";

revoke trigger on table "public"."user_modules" from "anon";

revoke truncate on table "public"."user_modules" from "anon";

revoke update on table "public"."user_modules" from "anon";

revoke delete on table "public"."user_modules" from "authenticated";

revoke insert on table "public"."user_modules" from "authenticated";

revoke references on table "public"."user_modules" from "authenticated";

revoke select on table "public"."user_modules" from "authenticated";

revoke trigger on table "public"."user_modules" from "authenticated";

revoke truncate on table "public"."user_modules" from "authenticated";

revoke update on table "public"."user_modules" from "authenticated";

revoke delete on table "public"."user_modules" from "service_role";

revoke insert on table "public"."user_modules" from "service_role";

revoke references on table "public"."user_modules" from "service_role";

revoke select on table "public"."user_modules" from "service_role";

revoke trigger on table "public"."user_modules" from "service_role";

revoke truncate on table "public"."user_modules" from "service_role";

revoke update on table "public"."user_modules" from "service_role";

alter table "public"."campaign_modules" drop constraint "campaign_modules_campaign_id_fkey";

alter table "public"."campaign_modules" drop constraint "campaign_modules_module_id_fkey";

alter table "public"."campaign_players" drop constraint "campaign_players_campaign_id_fkey";

alter table "public"."campaign_players" drop constraint "campaign_players_user_id_fkey";

alter table "public"."campaigns" drop constraint "campaigns_creator_id_fkey";

alter table "public"."module_dependencies" drop constraint "module_dependencies_dependency_id_fkey";

alter table "public"."module_dependencies" drop constraint "module_dependencies_module_id_fkey";

alter table "public"."user_modules" drop constraint "user_modules_module_id_fkey";

alter table "public"."user_modules" drop constraint "user_modules_user_id_fkey";

drop function if exists "public"."campaign_resource_ids"(p_campaign_id uuid, p_campaign_filter jsonb);

drop function if exists "public"."campaign_resource_ids_with_deps"(p_campaign_id uuid, p_campaign_filter jsonb);

drop function if exists "public"."can_edit_campaign_resource"(p_campaign_id uuid);

drop function if exists "public"."can_read_campaign_resource"(p_campaign_id uuid, p_resource_visibility public.campaign_role);

drop function if exists "public"."fetch_campaign_modules"(p_campaign_id uuid);

drop function if exists "public"."fetch_campaign_role"(p_campaign_id uuid);

drop function if exists "public"."fetch_campaigns"();

drop function if exists "public"."fetch_module_role"(p_module_id uuid);

drop function if exists "public"."fetch_modules"();

drop function if exists "public"."validate_campaign_module_is_module"();

drop function if exists "public"."validate_module_dependency_is_module"();

drop function if exists "public"."validate_user_module_is_module"();

alter table "public"."campaign_modules" drop constraint "campaign_modules_pkey";

alter table "public"."campaign_players" drop constraint "campaign_players_pkey";

alter table "public"."campaigns" drop constraint "campaign_pkey";

alter table "public"."module_dependencies" drop constraint "module_dependencies_pkey";

alter table "public"."user_modules" drop constraint "user_modules_pkey";

drop index if exists "public"."campaign_modules_pkey";

drop index if exists "public"."campaign_pkey";

drop index if exists "public"."campaign_players_pkey";

drop index if exists "public"."idx_campaign_modules_campaign_id";

drop index if exists "public"."idx_campaign_modules_module_id";

drop index if exists "public"."idx_campaign_players_user_id";

drop index if exists "public"."idx_campaigns_creator_id";

drop index if exists "public"."idx_campaigns_is_module";

drop index if exists "public"."idx_module_dependencies_dependency_id";

drop index if exists "public"."idx_module_dependencies_module_id";

drop index if exists "public"."idx_user_modules_module_id";

drop index if exists "public"."idx_user_modules_user_id";

drop index if exists "public"."module_dependencies_pkey";

drop index if exists "public"."user_modules_pkey";

drop table "public"."campaign_modules";

drop table "public"."campaign_players";

drop table "public"."campaigns";

drop table "public"."module_dependencies";

drop table "public"."user_modules";

drop type "public"."campaign_role";

drop type "public"."campaign_visibility";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_armors(p_source_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.armor_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_creatures(p_source_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.creature_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
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
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'creature'::public.resource_kind
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
  f.source_id,
  f.source_code,
  f.id,
  f.kind,
  f.visibility,
  f.image_url,
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

CREATE OR REPLACE FUNCTION public.fetch_spells(p_source_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.spell_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
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
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'spell'::public.resource_kind
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
  f.source_id,
  f.source_code,
  f.id,
  f.kind,
  f.visibility,
  f.image_url,
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

CREATE OR REPLACE FUNCTION public.fetch_weapons(p_source_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.weapon_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
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


