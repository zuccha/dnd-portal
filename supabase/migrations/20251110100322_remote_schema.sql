


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."campaign_role" AS ENUM (
    'game_master',
    'player'
);


ALTER TYPE "public"."campaign_role" OWNER TO "postgres";


CREATE TYPE "public"."character_class" AS ENUM (
    'artificer',
    'barbarian',
    'bard',
    'cleric',
    'druid',
    'fighter',
    'monk',
    'paladin',
    'ranger',
    'rogue',
    'sorcerer',
    'warlock',
    'wizard'
);


ALTER TYPE "public"."character_class" OWNER TO "postgres";


CREATE TYPE "public"."creature_ability" AS ENUM (
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma'
);


ALTER TYPE "public"."creature_ability" OWNER TO "postgres";


CREATE TYPE "public"."creature_alignment" AS ENUM (
    'lawful_good',
    'lawful_neutral',
    'lawful_evil',
    'neutral_good',
    'true_neutral',
    'neutral_evil',
    'chaotic_good',
    'chaotic_neutral',
    'chaotic_evil',
    'unaligned'
);


ALTER TYPE "public"."creature_alignment" OWNER TO "postgres";


CREATE TYPE "public"."creature_condition" AS ENUM (
    'blinded',
    'charmed',
    'deafened',
    'frightened',
    'grappled',
    'incapacitaded',
    'invisible',
    'paralyzed',
    'petrified',
    'poisoned',
    'prone',
    'restrained',
    'stunned',
    'unconcious',
    'exhaustion'
);


ALTER TYPE "public"."creature_condition" OWNER TO "postgres";


CREATE TYPE "public"."creature_habitat" AS ENUM (
    'any',
    'arctic',
    'coastal',
    'desert',
    'forest',
    'grassland',
    'hill',
    'mountain',
    'planar',
    'swamp',
    'underdark',
    'underwater',
    'urban'
);


ALTER TYPE "public"."creature_habitat" OWNER TO "postgres";


CREATE TYPE "public"."creature_size" AS ENUM (
    'tiny',
    'small',
    'medium',
    'large',
    'huge',
    'gargantuan'
);


ALTER TYPE "public"."creature_size" OWNER TO "postgres";


CREATE TYPE "public"."creature_skill" AS ENUM (
    'athletics',
    'acrobatics',
    'sleigh_of_hand',
    'stealth',
    'arcana',
    'history',
    'nature',
    'religion',
    'animal_handling',
    'insight',
    'medicine',
    'perception',
    'survival',
    'deception',
    'intimidation',
    'performance',
    'persuasion'
);


ALTER TYPE "public"."creature_skill" OWNER TO "postgres";


CREATE TYPE "public"."creature_treasure" AS ENUM (
    'any',
    'individual',
    'arcana',
    'armaments',
    'implements',
    'relics',
    'none'
);


ALTER TYPE "public"."creature_treasure" OWNER TO "postgres";


CREATE TYPE "public"."creature_type" AS ENUM (
    'aberration',
    'beast',
    'celestial',
    'construct',
    'dragon',
    'elemental',
    'fey',
    'fiend',
    'giant',
    'humanoid',
    'monstrosity',
    'ooze',
    'plant',
    'undead'
);


ALTER TYPE "public"."creature_type" OWNER TO "postgres";


CREATE TYPE "public"."damage_type" AS ENUM (
    'acid',
    'bludgeoning',
    'cold',
    'fire',
    'force',
    'lightning',
    'necrotic',
    'piercing',
    'poison',
    'psychic',
    'radiant',
    'slashing',
    'thunder'
);


ALTER TYPE "public"."damage_type" OWNER TO "postgres";


CREATE TYPE "public"."spell_casting_time" AS ENUM (
    'action',
    'bonus_action',
    'reaction',
    'value'
);


ALTER TYPE "public"."spell_casting_time" OWNER TO "postgres";


CREATE TYPE "public"."spell_duration" AS ENUM (
    'instantaneous',
    'special',
    'until_dispelled',
    'until_dispelled_or_triggered',
    'value'
);


ALTER TYPE "public"."spell_duration" OWNER TO "postgres";


CREATE TYPE "public"."spell_range" AS ENUM (
    'self',
    'sight',
    'special',
    'touch',
    'unlimited',
    'value'
);


ALTER TYPE "public"."spell_range" OWNER TO "postgres";


CREATE TYPE "public"."spell_school" AS ENUM (
    'abjuration',
    'conjuration',
    'divination',
    'enchantment',
    'evocation',
    'illusion',
    'necromancy',
    'transmutation'
);


ALTER TYPE "public"."spell_school" OWNER TO "postgres";


CREATE TYPE "public"."weapon_mastery" AS ENUM (
    'cleave',
    'graze',
    'nick',
    'push',
    'sap',
    'slow',
    'topple',
    'vex'
);


ALTER TYPE "public"."weapon_mastery" OWNER TO "postgres";


CREATE TYPE "public"."weapon_property" AS ENUM (
    'ammunition',
    'finesse',
    'heavy',
    'light',
    'loading',
    'range',
    'reach',
    'throw',
    'two-handed',
    'versatile'
);


ALTER TYPE "public"."weapon_property" OWNER TO "postgres";


CREATE TYPE "public"."weapon_type" AS ENUM (
    'simple',
    'martial'
);


ALTER TYPE "public"."weapon_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_creature"("p_campaign_id" "uuid", "p_lang" "text", "p_creature" "jsonb", "p_creature_translation" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_id uuid;
  r public.creatures%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.creatures, p_creature);

  insert into public.creatures (
    campaign_id, type, alignment, size, habitat, treasures, cr, ac, hp, hp_formula,
    speed_walk, speed_fly, speed_swim, speed_climb,
    ability_str, ability_dex, ability_con, ability_int, ability_wis, ability_cha,
    initiative, passive_perception, ability_proficiencies, skill_proficiencies,
    damage_immunities, damage_resistances, damage_vulnerabilities,
    condition_immunities, condition_resistances, condition_vulnerabilities,
    visibility
  ) values (
    p_campaign_id, r.type, r.alignment, r.size, r.habitat, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
    r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb,
    r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
    r.initiative, r.passive_perception, r.ability_proficiencies, r.skill_proficiencies,
    r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
    r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities,
    r.visibility
  )
  returning id into v_id;

  perform public.upsert_creature_translation(v_id, p_lang, p_creature_translation);

  return v_id;
end;
$$;


ALTER FUNCTION "public"."create_creature"("p_campaign_id" "uuid", "p_lang" "text", "p_creature" "jsonb", "p_creature_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_eldritch_invocation"("p_campaign_id" "uuid", "p_lang" "text", "p_eldritch_invocation" "jsonb", "p_eldritch_invocation_translation" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_id uuid;
  r public.eldritch_invocations%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.eldritch_invocations, p_eldritch_invocation);

  insert into public.eldritch_invocations (
    campaign_id, min_warlock_level, visibility
  ) values (
    p_campaign_id, r.min_warlock_level, r.visibility
  )
  returning id into v_id;

  perform public.upsert_eldritch_invocation_translation(v_id, p_lang, p_eldritch_invocation_translation);

  return v_id;
end;
$$;


ALTER FUNCTION "public"."create_eldritch_invocation"("p_campaign_id" "uuid", "p_lang" "text", "p_eldritch_invocation" "jsonb", "p_eldritch_invocation_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_spell"("p_campaign_id" "uuid", "p_lang" "text", "p_spell" "jsonb", "p_spell_translation" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_id uuid;
  r public.spells%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.spells, p_spell);

  insert into public.spells (
    campaign_id, level, school,
    character_classes, casting_time, casting_time_value,
    duration, duration_value, range, range_value_imp, range_value_met,
    concentration, ritual, verbal, somatic, material, visibility
  ) values (
    p_campaign_id, r.level, r.school,
    r.character_classes, r.casting_time, r.casting_time_value,
    r.duration, r.duration_value, r.range, r.range_value_imp, r.range_value_met,
    r.concentration, r.ritual, r.verbal, r.somatic, r.material, r.visibility
  )
  returning id into v_id;

  perform public.upsert_spell_translation(v_id, p_lang, p_spell_translation);

  return v_id;
end;
$$;


ALTER FUNCTION "public"."create_spell"("p_campaign_id" "uuid", "p_lang" "text", "p_spell" "jsonb", "p_spell_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_weapon"("p_campaign_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_id uuid;
  r public.weapons%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.weapons, p_weapon);

  insert into public.weapons (
    campaign_id, type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged, magic,
    range_ft_short, range_ft_long, range_m_short, range_m_long,
    weight_kg, weight_lb, cost, visibility
  ) values (
    p_campaign_id, r.type, r.damage, r.damage_versatile, r.damage_type,
    r.properties, r.mastery, r.melee, r.ranged, r.magic,
    r.range_ft_short, r.range_ft_long, r.range_m_short, r.range_m_long,
    r.weight_kg, r.weight_lb, r.cost, r.visibility
  )
  returning id into v_id;

  perform public.upsert_weapon_translation(v_id, p_lang, p_weapon_translation);

  return v_id;
end;
$$;


ALTER FUNCTION "public"."create_weapon"("p_campaign_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_campaign_role"("p_campaign_id" "uuid") RETURNS "public"."campaign_role"
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select cp.role
  from public.campaign_players cp
  where cp.campaign_id = p_campaign_id
    and cp.user_id = auth.uid()
  limit 1;
$$;


ALTER FUNCTION "public"."fetch_campaign_role"("p_campaign_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_creature"("p_id" "uuid") RETURNS "record"
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select
    r.id,
    r.campaign_id,
    c.name as campaign_name,
    r.type,
    r.alignment,
    r.size,
    r.habitat,
    r.treasures,
    r.cr,
    r.ac,
    r.hp,
    r.hp_formula,
    r.speed_walk,
    r.speed_fly,
    r.speed_swim,
    r.speed_climb,
    r.ability_str,
    r.ability_dex,
    r.ability_con,
    r.ability_int,
    r.ability_wis,
    r.ability_cha,
    r.initiative,
    r.passive_perception,
    r.ability_proficiencies,
    r.skill_proficiencies,
    r.damage_immunities,
    r.damage_resistances,
    r.damage_vulnerabilities,
    r.condition_immunities,
    r.condition_resistances,
    r.condition_vulnerabilities,
    r.visibility,
    coalesce(tt.name,              '{}'::jsonb)  as name,
    coalesce(tt.planes,            '{}'::jsonb)  as planes,
    coalesce(tt.senses,            '{}'::jsonb)  as senses,
    coalesce(tt.gear,              '{}'::jsonb)  as gear,
    coalesce(tt.traits,            '{}'::jsonb)  as traits,
    coalesce(tt.actions,           '{}'::jsonb)  as actions,
    coalesce(tt.bonus_actions,     '{}'::jsonb)  as bonus_actions,
    coalesce(tt.reactions,         '{}'::jsonb)  as reactions,
    coalesce(tt.legendary_actions, '{}'::jsonb)  as legendary_actions
  from public.creatures r
  join public.campaigns c on c.id = r.campaign_id
  left join (
    select
      r.id,
      jsonb_object_agg(t.lang, t.name)              as name,
      jsonb_object_agg(t.lang, t.planes)            as planes,
      jsonb_object_agg(t.lang, t.senses)            as senses,
      jsonb_object_agg(t.lang, t.gear)              as gear,
      jsonb_object_agg(t.lang, t.traits)            as traits,
      jsonb_object_agg(t.lang, t.actions)           as actions,
      jsonb_object_agg(t.lang, t.bonus_actions)     as bonus_actions,
      jsonb_object_agg(t.lang, t.reactions)         as reactions,
      jsonb_object_agg(t.lang, t.legendary_actions) as legendary_actions
    from public.creatures r
    left join public.creature_translations t on t.creature_id = r.id
    where r.id = p_id
    group by r.id
  ) tt on tt.id = r.id
  where r.id = p_id;
$$;


ALTER FUNCTION "public"."fetch_creature"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_eldritch_invocation"("p_id" "uuid") RETURNS "record"
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select
    e.id,
    e.campaign_id,
    c.name as campaign_name,
    e.min_warlock_level,
    coalesce(tt.name,         '{}'::jsonb)  as name,
    coalesce(tt.prerequisite, '{}'::jsonb)  as prerequisite,
    coalesce(tt.description,  '{}'::jsonb)  as description,
    e.visibility
  from public.eldritch_invocations e
  join public.campaigns c on c.id = e.campaign_id
  left join (
    select
      e.id,
      jsonb_object_agg(t.lang, t.name)         as name,
      jsonb_object_agg(t.lang, t.prerequisite) as prerequisite,
      jsonb_object_agg(t.lang, t.description)  as description
    from public.eldritch_invocations e
    left join public.eldritch_invocation_translations t on t.eldritch_invocation_id = e.id
    where e.id = p_id
    group by e.id
  ) tt on tt.id = e.id
  where e.id = p_id;
$$;


ALTER FUNCTION "public"."fetch_eldritch_invocation"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_eldritch_invocations"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb" DEFAULT '{}'::"jsonb", "p_order_by" "text" DEFAULT 'name'::"text", "p_order_dir" "text" DEFAULT 'asc'::"text") RETURNS TABLE("id" "uuid", "campaign_id" "uuid", "campaign_name" "text", "min_warlock_level" smallint, "name" "jsonb", "prerequisite" "jsonb", "description" "jsonb", "visibility" "public"."campaign_role")
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
with prefs as (
  select coalesce( (p_filters->>'warlock_level')::int, 20 ) as warlock_level
),
src as (
  select e.*
  from public.eldritch_invocations e
  join public.campaigns c on c.id = e.campaign_id
  where e.campaign_id = p_campaign_id
    --  or c.core = true
),
filtered as (
  select s.*
  from src s, prefs p
  where s.min_warlock_level <= p.warlock_level
),
t as (
  select
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                 as name,
    jsonb_object_agg(t.lang, t.prerequisite) filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as prerequisite,
    jsonb_object_agg(t.lang, t.description)  filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as description
  from filtered f
  left join public.eldritch_invocation_translations t on t.eldritch_invocation_id = f.id
  left join (select 1) _ on true  -- keep p_langs in scope
  group by f.id
)
select
  f.id,
  f.campaign_id,
  c.name as campaign_name,
  f.min_warlock_level,
  coalesce(tt.name,         '{}'::jsonb)  as name,
  coalesce(tt.prerequisite, '{}'::jsonb)  as prerequisite,
  coalesce(tt.description,  '{}'::jsonb)  as description,
  f.visibility
from filtered f
join public.campaigns c on c.id = f.campaign_id 
left join t tt on tt.id = f.id
order by
  case
    when p_order_by = 'name' and p_order_dir = 'asc'
      then (tt.name->>coalesce(p_langs[1],'en'))
  end asc nulls last,
  case
    when p_order_by = 'name' and p_order_dir = 'desc'
      then (tt.name->>coalesce(p_langs[1],'en'))
  end desc nulls last;
$$;


ALTER FUNCTION "public"."fetch_eldritch_invocations"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_spell"("p_id" "uuid") RETURNS "record"
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select
    s.id,
    s.campaign_id,
    c.name as campaign_name,
    s.level,
    s.character_classes,
    s.school,
    s.casting_time,
    s.casting_time_value,
    s.duration,
    s.duration_value,
    s.range,
    s.range_value_imp,
    s.range_value_met,
    s.concentration,
    s.ritual,
    s.somatic,
    s.verbal,
    s.material,
    coalesce(tt.name, '{}'::jsonb)        as name,
    coalesce(tt.description, '{}'::jsonb) as description,
    coalesce(tt.materials, '{}'::jsonb)   as materials,
    coalesce(tt.page, '{}'::jsonb)        as page,
    coalesce(tt.upgrade, '{}'::jsonb)     as upgrade,
    s.visibility
  from public.spells s
  join public.campaigns c on c.id = s.campaign_id
  left join (
    select
      s.id,
      jsonb_object_agg(t.lang, t.name)        as name,
      jsonb_object_agg(t.lang, t.description) as description,
      jsonb_object_agg(t.lang, t.materials)   as materials,
      jsonb_object_agg(t.lang, t.page)        as page,
      jsonb_object_agg(t.lang, t.upgrade)     as upgrade
    from public.spells s
    left join public.spell_translations t on t.spell_id = s.id
    where s.id = p_id
    group by s.id
  ) tt on tt.id = s.id
  where s.id = p_id;
$$;


ALTER FUNCTION "public"."fetch_spell"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_spells"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb" DEFAULT '{}'::"jsonb", "p_order_by" "text" DEFAULT 'name'::"text", "p_order_dir" "text" DEFAULT 'asc'::"text") RETURNS TABLE("id" "uuid", "campaign_id" "uuid", "campaign_name" "text", "level" smallint, "character_classes" "public"."character_class"[], "school" "public"."spell_school", "casting_time" "public"."spell_casting_time", "casting_time_value" "text", "duration" "public"."spell_duration", "duration_value" "text", "range" "public"."spell_range", "range_value_imp" "text", "range_value_met" "text", "concentration" boolean, "ritual" boolean, "somatic" boolean, "verbal" boolean, "material" boolean, "name" "jsonb", "description" "jsonb", "materials" "jsonb", "page" "jsonb", "upgrade" "jsonb", "visibility" "public"."campaign_role")
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
with prefs as (
  select
    -- levels
    (
      select coalesce(array_agg((e.key)::int), null)
      from jsonb_each_text(p_filters->'levels') as e(key, value)
      where e.value = 'true'
    ) as levels_inc,
    (
      select coalesce(array_agg((e.key)::int), null)
      from jsonb_each_text(p_filters->'levels') as e(key, value)
      where e.value = 'false'
    ) as levels_exc,

    -- classes
    (
      select coalesce(array_agg(lower(e.key)::public.character_class), null)
      from jsonb_each_text(p_filters->'character_classes') as e(key, value)
      where e.value = 'true'
    ) as classes_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.character_class), null)
      from jsonb_each_text(p_filters->'character_classes') as e(key, value)
      where e.value = 'false'
    ) as classes_exc,

    -- schools
    (
      select coalesce(array_agg(lower(e.key)::public.spell_school), null)
      from jsonb_each_text(p_filters->'schools') as e(key, value)
      where e.value = 'true'
    ) as schools_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.spell_school), null)
      from jsonb_each_text(p_filters->'schools') as e(key, value)
      where e.value = 'false'
    ) as schools_exc,

    -- boolean flags; null = not relevant
    (p_filters ? 'concentration')::int::boolean as has_conc_filter,
    (p_filters->>'concentration')::boolean      as conc_val,

    (p_filters ? 'ritual')::int::boolean        as has_rit_filter,
    (p_filters->>'ritual')::boolean             as rit_val,

    (p_filters ? 'material')::int::boolean      as has_mat_filter,
    (p_filters->>'material')::boolean           as mat_val,

    (p_filters ? 'somatic')::int::boolean       as has_som_filter,
    (p_filters->>'somatic')::boolean            as som_val,

    (p_filters ? 'verbal')::int::boolean        as has_ver_filter,
    (p_filters->>'verbal')::boolean             as ver_val
),
src as (
  select s.*
  from public.spells s
  join public.campaigns c on c.id = s.campaign_id
  where s.campaign_id = p_campaign_id
    --  or c.core = true
),
filtered as (
  select s.*
  from src s, prefs p
  where 
    -- levels
        (p.levels_inc is null or s.level = any(p.levels_inc))
    and (p.levels_exc is null or not (s.level = any(p.levels_exc)))

    -- classes
    and (p.classes_inc is null or s.character_classes && p.classes_inc)
    and (p.classes_exc is null or not (s.character_classes && p.classes_exc))

    -- schools
    and (p.schools_inc is null or s.school = any(p.schools_inc))
    and (p.schools_exc is null or not (s.school = any(p.schools_exc)))

    -- flags
    and (not p.has_conc_filter or s.concentration = p.conc_val)
    and (not p.has_rit_filter  or s.ritual        = p.rit_val)
    and (not p.has_mat_filter  or s.material      = p.mat_val)
    and (not p.has_som_filter  or s.somatic       = p.som_val)
    and (not p.has_ver_filter  or s.verbal        = p.ver_val)
),
t as (
  select
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                as name,
    jsonb_object_agg(t.lang, t.description) filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as description,
    jsonb_object_agg(t.lang, t.materials)   filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as materials,
    jsonb_object_agg(t.lang, t.page)        filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as page,
    jsonb_object_agg(t.lang, t.upgrade)     filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as upgrade
  from filtered f
  left join public.spell_translations t on t.spell_id = f.id
  left join (select 1) _ on true  -- keep p_langs in scope
  group by f.id
)
select
  f.id,
  f.campaign_id,
  c.name                                  as campaign_name,
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
  coalesce(tt.name, '{}'::jsonb)          as name,
  coalesce(tt.description, '{}'::jsonb)   as description,
  coalesce(tt.materials, '{}'::jsonb)     as materials,
  coalesce(tt.page, '{}'::jsonb)          as page,
  coalesce(tt.upgrade, '{}'::jsonb)       as upgrade,
  f.visibility
from filtered f
join public.campaigns c on c.id = f.campaign_id 
left join t tt on tt.id = f.id
order by
  case
    when p_order_by = 'name' and p_order_dir = 'asc'
      then (tt.name->>coalesce(p_langs[1],'en'))
  end asc nulls last,
  case
    when p_order_by = 'name' and p_order_dir = 'desc'
      then (tt.name->>coalesce(p_langs[1],'en'))
  end desc nulls last,
  case
    when p_order_by = 'level' and p_order_dir = 'asc'
      then f.level
  end asc nulls last,
  case
    when p_order_by = 'level' and p_order_dir = 'desc'
      then f.level
  end desc nulls last;
$$;


ALTER FUNCTION "public"."fetch_spells"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_weapon"("p_id" "uuid") RETURNS "record"
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select
    w.id,
    w.campaign_id,
    c.name as campaign_name,
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
    coalesce(tt.name,       '{}'::jsonb)  as name,
    coalesce(tt.notes,      '{}'::jsonb)  as notes,
    coalesce(tt.page,       '{}'::jsonb)  as page,
    coalesce(tt.ammunition, '{}'::jsonb)  as ammunition,
    w.visibility
  from public.weapons w
  join public.campaigns c on c.id = w.campaign_id
  left join (
    select
      w.id,
      jsonb_object_agg(t.lang, t.name)        as name,
      jsonb_object_agg(t.lang, t.notes)       as notes,
      jsonb_object_agg(t.lang, t.page)        as page,
      jsonb_object_agg(t.lang, t.ammunition)  as ammunition
    from public.weapons w
    left join public.weapon_translations t on t.weapon_id = w.id
    where w.id = p_id
    group by w.id
  ) tt on tt.id = w.id
  where w.id = p_id;
$$;


ALTER FUNCTION "public"."fetch_weapon"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_weapons"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb" DEFAULT '{}'::"jsonb", "p_order_by" "text" DEFAULT 'name'::"text", "p_order_dir" "text" DEFAULT 'asc'::"text") RETURNS TABLE("id" "uuid", "campaign_id" "uuid", "campaign_name" "text", "type" "public"."weapon_type", "damage" "text", "damage_type" "public"."damage_type", "damage_versatile" "text", "mastery" "public"."weapon_mastery", "properties" "public"."weapon_property"[], "magic" boolean, "melee" boolean, "ranged" boolean, "range_ft_long" real, "range_ft_short" real, "range_m_long" real, "range_m_short" real, "weight_kg" real, "weight_lb" real, "cost" real, "name" "jsonb", "notes" "jsonb", "page" "jsonb", "ammunition" "jsonb", "visibility" "public"."campaign_role")
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
with prefs as (
  select
    -- types
    (
      select coalesce(array_agg((e.key)::public.weapon_type), null)
      from jsonb_each_text(p_filters->'types') as e(key, value)
      where e.value = 'true'
    ) as types_inc,
    (
      select coalesce(array_agg((e.key)::public.weapon_type), null)
      from jsonb_each_text(p_filters->'types') as e(key, value)
      where e.value = 'false'
    ) as types_exc,

    -- properties
    (
      select coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      from jsonb_each_text(p_filters->'weapon_properties') as e(key, value)
      where e.value = 'true'
    ) as properties_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      from jsonb_each_text(p_filters->'weapon_properties') as e(key, value)
      where e.value = 'false'
    ) as properties_exc,

    -- mastery
    (
      select coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      from jsonb_each_text(p_filters->'masteries') as e(key, value)
      where e.value = 'true'
    ) as masteries_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      from jsonb_each_text(p_filters->'masteries') as e(key, value)
      where e.value = 'false'
    ) as masteries_exc,

    -- boolean flags; null = not relevant
    (p_filters ? 'magic')::int::boolean   as has_magic_filter,
    (p_filters->>'magic')::boolean        as magic_val,

    (p_filters ? 'melee')::int::boolean   as has_melee_filter,
    (p_filters->>'melee')::boolean        as melee_val,

    (p_filters ? 'ranged')::int::boolean  as has_ranged_filter,
    (p_filters->>'ranged')::boolean       as ranged_val
),
src as (
  select w.*
  from public.weapons w
  join public.campaigns c on c.id = w.campaign_id
  where w.campaign_id = p_campaign_id
    --  or c.core = true
),
filtered as (
  select s.*
  from src s, prefs p
  where 
    -- types
        (p.types_inc is null or s.type = any(p.types_inc))
    and (p.types_exc is null or not (s.type = any(p.types_exc)))

    -- properties
    and (p.properties_inc is null or s.properties && p.properties_inc)
    and (p.properties_exc is null or not (s.properties && p.properties_exc))

    -- masteries
    and (p.masteries_inc is null or s.mastery = any(p.masteries_inc))
    and (p.masteries_exc is null or not (s.mastery = any(p.masteries_exc)))

    -- flags
    and (not p.has_magic_filter  or s.magic  = p.magic_val)
    and (not p.has_melee_filter  or s.melee  = p.melee_val)
    and (not p.has_ranged_filter or s.ranged = p.ranged_val)
),
t as (
  select
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                as name,
    jsonb_object_agg(t.lang, t.notes)       filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as notes,
    jsonb_object_agg(t.lang, t.page)        filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as page,
    jsonb_object_agg(t.lang, t.ammunition)  filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as ammunition
  from filtered f
  left join public.weapon_translations t on t.weapon_id = f.id
  left join (select 1) _ on true  -- keep p_langs in scope
  group by f.id
)
select
  f.id,
  f.campaign_id,
  c.name as campaign_name,
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
  coalesce(tt.name,       '{}'::jsonb)  as name,
  coalesce(tt.notes,      '{}'::jsonb)  as notes,
  coalesce(tt.page,       '{}'::jsonb)  as page,
  coalesce(tt.ammunition, '{}'::jsonb)  as ammunition,
  f.visibility
from filtered f
join public.campaigns c on c.id = f.campaign_id 
left join t tt on tt.id = f.id
order by
  case
    when p_order_by = 'name' and p_order_dir = 'asc'
      then (tt.name->>coalesce(p_langs[1],'en'))
  end asc nulls last,
  case
    when p_order_by = 'name' and p_order_dir = 'desc'
      then (tt.name->>coalesce(p_langs[1],'en'))
  end desc nulls last;
$$;


ALTER FUNCTION "public"."fetch_weapons"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_creature"("p_id" "uuid", "p_lang" "text", "p_creature" "jsonb", "p_creature_translation" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_rows int;
begin
  update public.creatures c
  set (
    type, alignment, size, habitat, treasure, cr, ac, hp, hp_formula,
    speed_walk, speed_fly, speed_swim, speed_climb,
    ability_str, ability_dex, ability_con, ability_int, ability_wis, ability_cha,
    initiative, passive_perception, ability_proficiencies, skill_proficiencies,
    damage_immunities, damage_resistances, damage_vulnerabilities,
    condition_immunities, condition_resistances, condition_vulnerabilities,
    visibility
  ) = (
    select r.type, r.alignment, r.size, r.habitat, r.treasure, r.cr, r.ac, r.hp, r.hp_formula,
      r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb,
      r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
      r.initiative, r.passive_perception, r.ability_proficiencies, r.skill_proficiencies,
      r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
      r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities,
      r.visibility
    from jsonb_populate_record(null::public.creatures, to_jsonb(s) || p_creature) as r
  )
  where c.id = p_id;

  get diagnostics v_rows = ROW_COUNT;
  if v_rows = 0 then
    raise exception 'No row with id %', p_id;
  end if;

  perform public.upsert_creature_translation(p_id, p_lang, p_creature_translation);
end;
$$;


ALTER FUNCTION "public"."update_creature"("p_id" "uuid", "p_lang" "text", "p_creature" "jsonb", "p_creature_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_eldritch_invocation"("p_id" "uuid", "p_lang" "text", "p_eldritch_invocation" "jsonb", "p_eldritch_invocation_translation" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_rows int;
begin
  update public.eldritch_invocations e
  set (
    min_warlock_level, visibility
  ) = (
    select r.min_warlock_level, r.visibility
    from jsonb_populate_record(null::public.eldritch_invocations, to_jsonb(e) || p_eldritch_invocation) as r
  )
  where e.id = p_id;

  get diagnostics v_rows = ROW_COUNT;
  if v_rows = 0 then
    raise exception 'No row with id %', p_id;
  end if;

  perform public.upsert_eldritch_invocation_translation(p_id, p_lang, p_eldritch_invocation_translation);
end;
$$;


ALTER FUNCTION "public"."update_eldritch_invocation"("p_id" "uuid", "p_lang" "text", "p_eldritch_invocation" "jsonb", "p_eldritch_invocation_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_spell"("p_id" "uuid", "p_lang" "text", "p_spell" "jsonb", "p_spell_translation" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_rows int;
begin
  update public.spells s
  set (
    level, school, character_classes, casting_time, casting_time_value,
    duration, duration_value, range, range_value_imp, range_value_met,
    concentration, ritual, verbal, somatic, material, visibility
  ) = (
    select r.level, r.school, r.character_classes, r.casting_time, r.casting_time_value,
           r.duration, r.duration_value, r.range, r.range_value_imp, r.range_value_met,
           r.concentration, r.ritual, r.verbal, r.somatic, r.material, r.visibility
    from jsonb_populate_record(null::public.spells, to_jsonb(s) || p_spell) as r
  )
  where s.id = p_id;

  get diagnostics v_rows = ROW_COUNT;
  if v_rows = 0 then
    raise exception 'No row with id %', p_id;
  end if;

  perform public.upsert_spell_translation(p_id, p_lang, p_spell_translation);
end;
$$;


ALTER FUNCTION "public"."update_spell"("p_id" "uuid", "p_lang" "text", "p_spell" "jsonb", "p_spell_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_weapon"("p_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_rows int;
begin
  update public.weapons s
  set (
    type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged, magic,
    range_ft_short, range_ft_long, range_m_short, range_m_long,
    weight_kg, weight_lb, cost, visibility
  ) = (
    select r.type, r.damage, r.damage_versatile, r.damage_type,
           r.properties, r.mastery, r.melee, r.ranged, r.magic,
           r.range_ft_short, r.range_ft_long, r.range_m_short, r.range_m_long,
           r.weight_kg, r.weight_lb, r.cost, r.visibility
    from jsonb_populate_record(null::public.weapons, to_jsonb(s) || p_weapon) as r
  )
  where s.id = p_id;

  get diagnostics v_rows = ROW_COUNT;
  if v_rows = 0 then
    raise exception 'No row with id %', p_id;
  end if;

  perform public.upsert_weapon_translation(p_id, p_lang, p_weapon_translation);
end;
$$;


ALTER FUNCTION "public"."update_weapon"("p_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_creature_translation"("p_id" "uuid", "p_lang" "text", "p_creature_translation" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  r public.creature_translations%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.creature_translations, p_creature_translation);

  insert into public.creature_translations as ct (
    creature_id, lang, name, planes, senses, gear,
    traits, actions, bonus_actions, reactions, legendary_actions
  ) values (
    p_id, p_lang, r.name, r.planes, r.senses, r.gear,
    r.traits, r.actions, r.bonus_actions, r.reactions, r.legendary_actions
  )
  on conflict (creature_id, lang) do update
  set 
    name = excluded.name,
    planes = excluded.planes,
    senses = excluded.senses,
    gear = excluded.gear,
    traits = excluded.traits,
    actions = excluded.actions,
    bonus_actions = excluded.bonus_actions,
    reactions = excluded.reactions,
    legendary_actions = excluded.legendary_actions;
end;
$$;


ALTER FUNCTION "public"."upsert_creature_translation"("p_id" "uuid", "p_lang" "text", "p_creature_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_eldritch_invocation_translation"("p_id" "uuid", "p_lang" "text", "p_eldritch_invocation_translation" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  r public.eldritch_invocation_translations%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.eldritch_invocation_translations, p_eldritch_invocation_translation);

  insert into public.eldritch_invocation_translations as st (
    eldritch_invocation_id, lang, name, prerequisite, description
  ) values (
    p_id, p_lang, r.name, r.prerequisite, r.description
  )
  on conflict (eldritch_invocation_id, lang) do update
  set 
    name = excluded.name,
    prerequisite = excluded.prerequisite,
    description = excluded.description;
end;
$$;


ALTER FUNCTION "public"."upsert_eldritch_invocation_translation"("p_id" "uuid", "p_lang" "text", "p_eldritch_invocation_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_spell_translation"("p_id" "uuid", "p_lang" "text", "p_spell_translation" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  r public.spell_translations%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.spell_translations, p_spell_translation);

  insert into public.spell_translations as st (
    spell_id, lang, name, page,
    materials, description, upgrade
  ) values (
    p_id, p_lang, r.name, r.page,
    r.materials, r.description, r.upgrade
  )
  on conflict (spell_id, lang) do update
  set 
    name = excluded.name,
    page = excluded.page,
    materials = excluded.materials,
    description = excluded.description,
    upgrade = excluded.upgrade;
end;
$$;


ALTER FUNCTION "public"."upsert_spell_translation"("p_id" "uuid", "p_lang" "text", "p_spell_translation" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_weapon_translation"("p_id" "uuid", "p_lang" "text", "p_weapon_translation" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  r public.weapon_translations%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.weapon_translations, p_weapon_translation);

  insert into public.weapon_translations as st (
    weapon_id, lang, name, page,
    ammunition, notes
  ) values (
    p_id, p_lang, r.name, r.page,
    r.ammunition, r.notes
  )
  on conflict (weapon_id, lang) do update
  set 
    name = excluded.name,
    page = excluded.page,
    ammunition = excluded.ammunition,
    notes = excluded.notes;
end;
$$;


ALTER FUNCTION "public"."upsert_weapon_translation"("p_id" "uuid", "p_lang" "text", "p_weapon_translation" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."campaign_players" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "campaign_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "public"."campaign_role" DEFAULT 'player'::"public"."campaign_role" NOT NULL
);


ALTER TABLE "public"."campaign_players" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "core" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."creature_translations" (
    "creature_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lang" "text" NOT NULL,
    "senses" "text",
    "gear" "text",
    "traits" "text",
    "actions" "text",
    "bonus_actions" "text",
    "reactions" "text",
    "legendary_actions" "text",
    "planes" "text",
    "name" "text" NOT NULL
);


ALTER TABLE "public"."creature_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."creatures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."creature_type" NOT NULL,
    "alignment" "public"."creature_alignment" NOT NULL,
    "size" "public"."creature_size" NOT NULL,
    "cr" smallint DEFAULT '0'::smallint NOT NULL,
    "ac" "text" DEFAULT ''::"text" NOT NULL,
    "hp" "text" DEFAULT ''::"text" NOT NULL,
    "hp_formula" "text" DEFAULT ''::"text" NOT NULL,
    "speed_walk" "text",
    "speed_fly" "text",
    "speed_swim" "text",
    "speed_climb" "text",
    "ability_str" smallint DEFAULT '10'::smallint NOT NULL,
    "ability_dex" smallint DEFAULT '10'::smallint NOT NULL,
    "ability_con" smallint DEFAULT '10'::smallint NOT NULL,
    "ability_int" smallint DEFAULT '10'::smallint NOT NULL,
    "ability_wis" smallint DEFAULT '10'::smallint NOT NULL,
    "ability_cha" smallint DEFAULT '10'::smallint NOT NULL,
    "initiative" "text" DEFAULT ''::"text" NOT NULL,
    "passive_perception" "text" DEFAULT ''::"text" NOT NULL,
    "ability_proficiencies" "public"."creature_ability"[] NOT NULL,
    "skill_proficiencies" "public"."creature_skill"[] NOT NULL,
    "damage_immunities" "public"."damage_type"[] NOT NULL,
    "damage_resistances" "public"."damage_type"[] NOT NULL,
    "damage_vulnerabilities" "public"."damage_type"[] NOT NULL,
    "condition_immunities" "public"."creature_condition"[] NOT NULL,
    "condition_resistances" "public"."creature_condition"[] NOT NULL,
    "condition_vulnerabilities" "public"."creature_condition"[] NOT NULL,
    "habitat" "public"."creature_habitat"[] NOT NULL,
    "treasures" "public"."creature_treasure"[] NOT NULL,
    "visibility" "public"."campaign_role" DEFAULT 'game_master'::"public"."campaign_role" NOT NULL
);


ALTER TABLE "public"."creatures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eldritch_invocation_translations" (
    "eldritch_invocation_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lang" "text" DEFAULT ''::"text" NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "prerequisite" "text",
    "description" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "public"."eldritch_invocation_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."eldritch_invocations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "min_warlock_level" smallint NOT NULL,
    "visibility" "public"."campaign_role" DEFAULT 'game_master'::"public"."campaign_role" NOT NULL,
    CONSTRAINT "eldritch_invocations_min_warlock_level_check" CHECK ((("min_warlock_level" >= 0) AND ("min_warlock_level" <= 20)))
);


ALTER TABLE "public"."eldritch_invocations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."languages" (
    "code" "text" NOT NULL,
    "label" "text" NOT NULL,
    CONSTRAINT "languages_code_check" CHECK (("code" ~ '^[a-z]{2}(-[A-Z]{2})?$'::"text"))
);


ALTER TABLE "public"."languages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."spell_translations" (
    "spell_id" "uuid" NOT NULL,
    "lang" "text" NOT NULL,
    "name" "text" NOT NULL,
    "page" "text",
    "materials" "text",
    "description" "text" NOT NULL,
    "upgrade" "text"
);


ALTER TABLE "public"."spell_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."spells" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level" smallint NOT NULL,
    "school" "public"."spell_school" NOT NULL,
    "character_classes" "public"."character_class"[] NOT NULL,
    "concentration" boolean NOT NULL,
    "ritual" boolean NOT NULL,
    "somatic" boolean NOT NULL,
    "verbal" boolean NOT NULL,
    "material" boolean NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "visibility" "public"."campaign_role" DEFAULT 'player'::"public"."campaign_role" NOT NULL,
    "casting_time" "public"."spell_casting_time" DEFAULT 'action'::"public"."spell_casting_time" NOT NULL,
    "casting_time_value" "text",
    "duration" "public"."spell_duration" DEFAULT 'value'::"public"."spell_duration" NOT NULL,
    "duration_value" "text",
    "range" "public"."spell_range" DEFAULT 'self'::"public"."spell_range" NOT NULL,
    "range_value_imp" "text",
    "range_value_met" "text",
    CONSTRAINT "spells_casting_time_pair_chk" CHECK ((("casting_time" = 'value'::"public"."spell_casting_time") = ("casting_time_value" IS NOT NULL))),
    CONSTRAINT "spells_casting_time_value_check" CHECK (("casting_time_value" ~ '^\d+(\.\d+)?\s*(round|s|min|hr|d)$'::"text")),
    CONSTRAINT "spells_duration_pair_chk" CHECK ((("duration" = 'value'::"public"."spell_duration") = ("duration_value" IS NOT NULL))),
    CONSTRAINT "spells_duration_value_check" CHECK (("duration_value" ~ '^\d+(\.\d+)?\s*(round|s|min|hr|d)$'::"text")),
    CONSTRAINT "spells_level_check" CHECK ((("level" >= 0) AND ("level" <= 9))),
    CONSTRAINT "spells_range_pair_chk" CHECK (((("range" = 'value'::"public"."spell_range") = ("range_value_imp" IS NOT NULL)) AND (("range" = 'value'::"public"."spell_range") = ("range_value_met" IS NOT NULL)))),
    CONSTRAINT "spells_range_value_imp_check" CHECK (("range_value_imp" ~ '^\d+(\.\d+)?\s*(ft|mi)$'::"text")),
    CONSTRAINT "spells_range_value_met_check" CHECK (("range_value_met" ~ '^\d+(\.\d+)?\s*(m|km)$'::"text"))
);


ALTER TABLE "public"."spells" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."weapon_translations" (
    "weapon_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lang" "text" NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "page" "text",
    "notes" "text",
    "ammunition" "text"
);


ALTER TABLE "public"."weapon_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."weapons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "campaign_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "damage" "text" DEFAULT ''::"text" NOT NULL,
    "damage_versatile" "text",
    "damage_type" "public"."damage_type" NOT NULL,
    "properties" "public"."weapon_property"[] NOT NULL,
    "mastery" "public"."weapon_mastery" NOT NULL,
    "melee" boolean NOT NULL,
    "ranged" boolean NOT NULL,
    "magic" boolean,
    "range_ft_short" real,
    "range_ft_long" real,
    "range_m_short" real,
    "range_m_long" real,
    "weight_lb" real NOT NULL,
    "weight_kg" real NOT NULL,
    "cost" real NOT NULL,
    "visibility" "public"."campaign_role" DEFAULT 'player'::"public"."campaign_role" NOT NULL,
    "type" "public"."weapon_type" NOT NULL,
    CONSTRAINT "weapons_damage_versatile_check" CHECK ((("damage_versatile" IS NOT NULL) = ("properties" @> ARRAY['versatile'::"public"."weapon_property"]))),
    CONSTRAINT "weapons_ranged_range_check" CHECK (("ranged" = (("range_ft_short" IS NOT NULL) AND ("range_ft_long" IS NOT NULL) AND ("range_m_short" IS NOT NULL) AND ("range_m_long" IS NOT NULL))))
);


ALTER TABLE "public"."weapons" OWNER TO "postgres";


ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaign_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_players"
    ADD CONSTRAINT "campaign_players_pkey" PRIMARY KEY ("campaign_id", "user_id");



ALTER TABLE ONLY "public"."creatures"
    ADD CONSTRAINT "creature_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."creature_translations"
    ADD CONSTRAINT "creature_translations_pkey" PRIMARY KEY ("creature_id", "lang");



ALTER TABLE ONLY "public"."eldritch_invocation_translations"
    ADD CONSTRAINT "eldritch_invocation_translations_pkey" PRIMARY KEY ("eldritch_invocation_id", "lang");



ALTER TABLE ONLY "public"."eldritch_invocations"
    ADD CONSTRAINT "eldritch_invocations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."languages"
    ADD CONSTRAINT "languages_pkey" PRIMARY KEY ("code");



ALTER TABLE ONLY "public"."spell_translations"
    ADD CONSTRAINT "spell_translations_pkey" PRIMARY KEY ("spell_id", "lang");



ALTER TABLE ONLY "public"."spells"
    ADD CONSTRAINT "spells_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."weapon_translations"
    ADD CONSTRAINT "weapon_translations_pkey" PRIMARY KEY ("weapon_id", "lang");



ALTER TABLE ONLY "public"."weapons"
    ADD CONSTRAINT "weapons_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_campaign_players_user_id" ON "public"."campaign_players" USING "btree" ("user_id");



CREATE INDEX "idx_spell_translations_lang" ON "public"."spell_translations" USING "btree" ("lang");



ALTER TABLE ONLY "public"."campaign_players"
    ADD CONSTRAINT "campaign_players_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_players"
    ADD CONSTRAINT "campaign_players_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."creatures"
    ADD CONSTRAINT "creature_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."creature_translations"
    ADD CONSTRAINT "creature_translations_creature_id_fkey" FOREIGN KEY ("creature_id") REFERENCES "public"."creatures"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."eldritch_invocation_translations"
    ADD CONSTRAINT "eldritch_invocation_translations_eldritch_invocation_id_fkey" FOREIGN KEY ("eldritch_invocation_id") REFERENCES "public"."eldritch_invocations"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."eldritch_invocations"
    ADD CONSTRAINT "eldritch_invocations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spell_translations"
    ADD CONSTRAINT "spell_translations_lang_fkey" FOREIGN KEY ("lang") REFERENCES "public"."languages"("code") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spell_translations"
    ADD CONSTRAINT "spell_translations_spell_id_fkey" FOREIGN KEY ("spell_id") REFERENCES "public"."spells"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."spells"
    ADD CONSTRAINT "spells_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weapon_translations"
    ADD CONSTRAINT "weapon_translations_weapon_id_fkey" FOREIGN KEY ("weapon_id") REFERENCES "public"."weapons"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."weapons"
    ADD CONSTRAINT "weapons_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Enable read access for all users" ON "public"."languages" FOR SELECT USING (true);



CREATE POLICY "GMs can manipulate creatures in their campaigns" ON "public"."creature_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."creatures" "c"
     JOIN "public"."campaign_players" "cp" ON ((("cp"."campaign_id" = "c"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("cp"."role" = 'game_master'::"public"."campaign_role"))))
  WHERE ("c"."id" = "creature_translations"."creature_id"))));



CREATE POLICY "GMs can manipulate creatures in their campaigns" ON "public"."creatures" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campaign_players" "cp"
  WHERE (("cp"."campaign_id" = "creatures"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("cp"."role" = 'game_master'::"public"."campaign_role")))));



CREATE POLICY "GMs can manipulate eldritch invocations in their campaigns" ON "public"."eldritch_invocation_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."eldritch_invocations" "e"
     JOIN "public"."campaign_players" "cp" ON ((("cp"."campaign_id" = "e"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("cp"."role" = 'game_master'::"public"."campaign_role"))))
  WHERE ("e"."id" = "eldritch_invocation_translations"."eldritch_invocation_id"))));



CREATE POLICY "GMs can manipulate eldritch invocations in their campaigns" ON "public"."eldritch_invocations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campaign_players" "cp"
  WHERE (("cp"."campaign_id" = "eldritch_invocations"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("cp"."role" = 'game_master'::"public"."campaign_role")))));



CREATE POLICY "GMs can manipulate spells in their campaigns" ON "public"."spell_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."spells" "s"
     JOIN "public"."campaign_players" "cp" ON ((("cp"."campaign_id" = "s"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("cp"."role" = 'game_master'::"public"."campaign_role"))))
  WHERE ("s"."id" = "spell_translations"."spell_id"))));



CREATE POLICY "GMs can manipulate spells in their campaigns" ON "public"."spells" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campaign_players" "cp"
  WHERE (("cp"."campaign_id" = "spells"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("cp"."role" = 'game_master'::"public"."campaign_role")))));



CREATE POLICY "GMs can manipulate weapons in their campaigns" ON "public"."weapon_translations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."weapons" "w"
     JOIN "public"."campaign_players" "cp" ON ((("cp"."campaign_id" = "w"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("cp"."role" = 'game_master'::"public"."campaign_role"))))
  WHERE ("w"."id" = "weapon_translations"."weapon_id"))));



CREATE POLICY "GMs can manipulate weapons in their campaigns" ON "public"."weapons" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campaign_players" "cp"
  WHERE (("cp"."campaign_id" = "weapons"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("cp"."role" = 'game_master'::"public"."campaign_role")))));



CREATE POLICY "Players can read campaigns they joined" ON "public"."campaigns" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campaign_players" "cp"
  WHERE (("cp"."campaign_id" = "campaigns"."id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Players can read core campaigns" ON "public"."campaigns" FOR SELECT USING (("core" = true));



CREATE POLICY "Players can read creatures from core campaigns" ON "public"."creature_translations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."creatures" "m"
     JOIN "public"."campaigns" "c" ON (("c"."id" = "m"."campaign_id")))
  WHERE (("m"."id" = "creature_translations"."creature_id") AND ("c"."core" = true)))));



CREATE POLICY "Players can read creatures from core campaigns" ON "public"."creatures" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campaigns" "c"
  WHERE (("c"."id" = "creatures"."campaign_id") AND ("c"."core" = true)))));



CREATE POLICY "Players can read eldritch invocations from core campaigns" ON "public"."eldritch_invocation_translations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."eldritch_invocations" "e"
     JOIN "public"."campaigns" "c" ON (("c"."id" = "e"."campaign_id")))
  WHERE (("e"."id" = "eldritch_invocation_translations"."eldritch_invocation_id") AND ("c"."core" = true)))));



CREATE POLICY "Players can read eldritch invocations from core campaigns" ON "public"."eldritch_invocations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campaigns" "c"
  WHERE (("c"."id" = "eldritch_invocations"."campaign_id") AND ("c"."core" = true)))));



CREATE POLICY "Players can read public creatures from their campaigns" ON "public"."creature_translations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."creatures" "e"
  WHERE (("e"."id" = "creature_translations"."creature_id") AND ("e"."visibility" = 'player'::"public"."campaign_role") AND (EXISTS ( SELECT 1
           FROM "public"."campaign_players" "cp"
          WHERE (("cp"."campaign_id" = "e"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))))));



CREATE POLICY "Players can read public creatures from their campaigns" ON "public"."creatures" FOR SELECT TO "authenticated" USING ((("visibility" = 'player'::"public"."campaign_role") AND (EXISTS ( SELECT 1
   FROM "public"."campaign_players" "cp"
  WHERE (("cp"."campaign_id" = "creatures"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "Players can read public eldritch invocations from campaigns the" ON "public"."eldritch_invocation_translations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."eldritch_invocations" "e"
  WHERE (("e"."id" = "eldritch_invocation_translations"."eldritch_invocation_id") AND ("e"."visibility" = 'player'::"public"."campaign_role") AND (EXISTS ( SELECT 1
           FROM "public"."campaign_players" "cp"
          WHERE (("cp"."campaign_id" = "e"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))))));



CREATE POLICY "Players can read public eldritch invocations from campaigns the" ON "public"."eldritch_invocations" FOR SELECT TO "authenticated" USING ((("visibility" = 'player'::"public"."campaign_role") AND (EXISTS ( SELECT 1
   FROM "public"."campaign_players" "cp"
  WHERE (("cp"."campaign_id" = "eldritch_invocations"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "Players can read public spells from campaigns they joined" ON "public"."spell_translations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."spells" "s"
  WHERE (("s"."id" = "spell_translations"."spell_id") AND ("s"."visibility" = 'player'::"public"."campaign_role") AND (EXISTS ( SELECT 1
           FROM "public"."campaign_players" "cp"
          WHERE (("cp"."campaign_id" = "s"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))))));



CREATE POLICY "Players can read public spells from campaigns they joined" ON "public"."spells" FOR SELECT TO "authenticated" USING ((("visibility" = 'player'::"public"."campaign_role") AND (EXISTS ( SELECT 1
   FROM "public"."campaign_players" "cp"
  WHERE (("cp"."campaign_id" = "spells"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "Players can read public weapons from campaigns they joined" ON "public"."weapon_translations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."weapons" "w"
  WHERE (("w"."id" = "weapon_translations"."weapon_id") AND ("w"."visibility" = 'player'::"public"."campaign_role") AND (EXISTS ( SELECT 1
           FROM "public"."campaign_players" "cp"
          WHERE (("cp"."campaign_id" = "w"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))))));



CREATE POLICY "Players can read public weapons from campaigns they joined" ON "public"."weapons" FOR SELECT TO "authenticated" USING ((("visibility" = 'player'::"public"."campaign_role") AND (EXISTS ( SELECT 1
   FROM "public"."campaign_players" "cp"
  WHERE (("cp"."campaign_id" = "weapons"."campaign_id") AND ("cp"."user_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "Players can read spells from core campaigns" ON "public"."spell_translations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."spells" "s"
     JOIN "public"."campaigns" "c" ON (("c"."id" = "s"."campaign_id")))
  WHERE (("s"."id" = "spell_translations"."spell_id") AND ("c"."core" = true)))));



CREATE POLICY "Players can read spells from core campaigns" ON "public"."spells" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campaigns" "c"
  WHERE (("c"."id" = "spells"."campaign_id") AND ("c"."core" = true)))));



CREATE POLICY "Players can read weapons from core campaigns" ON "public"."weapon_translations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."weapons" "w"
     JOIN "public"."campaigns" "c" ON (("c"."id" = "w"."campaign_id")))
  WHERE (("w"."id" = "weapon_translations"."weapon_id") AND ("c"."core" = true)))));



CREATE POLICY "Players can read weapons from core campaigns" ON "public"."weapons" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."campaigns" "c"
  WHERE (("c"."id" = "weapons"."campaign_id") AND ("c"."core" = true)))));



CREATE POLICY "Users can check if they joined a campaign" ON "public"."campaign_players" FOR SELECT TO "authenticated" USING (("user_id" = ( SELECT "auth"."uid"() AS "uid")));



ALTER TABLE "public"."campaign_players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."creature_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."creatures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."eldritch_invocation_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."eldritch_invocations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."languages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."spell_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."spells" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weapon_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."weapons" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_creature"("p_campaign_id" "uuid", "p_lang" "text", "p_creature" "jsonb", "p_creature_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_creature"("p_campaign_id" "uuid", "p_lang" "text", "p_creature" "jsonb", "p_creature_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_creature"("p_campaign_id" "uuid", "p_lang" "text", "p_creature" "jsonb", "p_creature_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_eldritch_invocation"("p_campaign_id" "uuid", "p_lang" "text", "p_eldritch_invocation" "jsonb", "p_eldritch_invocation_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_eldritch_invocation"("p_campaign_id" "uuid", "p_lang" "text", "p_eldritch_invocation" "jsonb", "p_eldritch_invocation_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_eldritch_invocation"("p_campaign_id" "uuid", "p_lang" "text", "p_eldritch_invocation" "jsonb", "p_eldritch_invocation_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_spell"("p_campaign_id" "uuid", "p_lang" "text", "p_spell" "jsonb", "p_spell_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_spell"("p_campaign_id" "uuid", "p_lang" "text", "p_spell" "jsonb", "p_spell_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_spell"("p_campaign_id" "uuid", "p_lang" "text", "p_spell" "jsonb", "p_spell_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_weapon"("p_campaign_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_weapon"("p_campaign_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_weapon"("p_campaign_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_campaign_role"("p_campaign_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_campaign_role"("p_campaign_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_campaign_role"("p_campaign_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_creature"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_creature"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_creature"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_eldritch_invocation"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_eldritch_invocation"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_eldritch_invocation"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_eldritch_invocations"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_eldritch_invocations"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_eldritch_invocations"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_spell"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_spell"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_spell"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_spells"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_spells"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_spells"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_weapon"("p_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_weapon"("p_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_weapon"("p_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_weapons"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_weapons"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_weapons"("p_campaign_id" "uuid", "p_langs" "text"[], "p_filters" "jsonb", "p_order_by" "text", "p_order_dir" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_creature"("p_id" "uuid", "p_lang" "text", "p_creature" "jsonb", "p_creature_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_creature"("p_id" "uuid", "p_lang" "text", "p_creature" "jsonb", "p_creature_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_creature"("p_id" "uuid", "p_lang" "text", "p_creature" "jsonb", "p_creature_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_eldritch_invocation"("p_id" "uuid", "p_lang" "text", "p_eldritch_invocation" "jsonb", "p_eldritch_invocation_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_eldritch_invocation"("p_id" "uuid", "p_lang" "text", "p_eldritch_invocation" "jsonb", "p_eldritch_invocation_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_eldritch_invocation"("p_id" "uuid", "p_lang" "text", "p_eldritch_invocation" "jsonb", "p_eldritch_invocation_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_spell"("p_id" "uuid", "p_lang" "text", "p_spell" "jsonb", "p_spell_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_spell"("p_id" "uuid", "p_lang" "text", "p_spell" "jsonb", "p_spell_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_spell"("p_id" "uuid", "p_lang" "text", "p_spell" "jsonb", "p_spell_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_weapon"("p_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_weapon"("p_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_weapon"("p_id" "uuid", "p_lang" "text", "p_weapon" "jsonb", "p_weapon_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_creature_translation"("p_id" "uuid", "p_lang" "text", "p_creature_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_creature_translation"("p_id" "uuid", "p_lang" "text", "p_creature_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_creature_translation"("p_id" "uuid", "p_lang" "text", "p_creature_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_eldritch_invocation_translation"("p_id" "uuid", "p_lang" "text", "p_eldritch_invocation_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_eldritch_invocation_translation"("p_id" "uuid", "p_lang" "text", "p_eldritch_invocation_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_eldritch_invocation_translation"("p_id" "uuid", "p_lang" "text", "p_eldritch_invocation_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_spell_translation"("p_id" "uuid", "p_lang" "text", "p_spell_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_spell_translation"("p_id" "uuid", "p_lang" "text", "p_spell_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_spell_translation"("p_id" "uuid", "p_lang" "text", "p_spell_translation" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_weapon_translation"("p_id" "uuid", "p_lang" "text", "p_weapon_translation" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_weapon_translation"("p_id" "uuid", "p_lang" "text", "p_weapon_translation" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_weapon_translation"("p_id" "uuid", "p_lang" "text", "p_weapon_translation" "jsonb") TO "service_role";


















GRANT ALL ON TABLE "public"."campaign_players" TO "anon";
GRANT ALL ON TABLE "public"."campaign_players" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_players" TO "service_role";



GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."creature_translations" TO "anon";
GRANT ALL ON TABLE "public"."creature_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."creature_translations" TO "service_role";



GRANT ALL ON TABLE "public"."creatures" TO "anon";
GRANT ALL ON TABLE "public"."creatures" TO "authenticated";
GRANT ALL ON TABLE "public"."creatures" TO "service_role";



GRANT ALL ON TABLE "public"."eldritch_invocation_translations" TO "anon";
GRANT ALL ON TABLE "public"."eldritch_invocation_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."eldritch_invocation_translations" TO "service_role";



GRANT ALL ON TABLE "public"."eldritch_invocations" TO "anon";
GRANT ALL ON TABLE "public"."eldritch_invocations" TO "authenticated";
GRANT ALL ON TABLE "public"."eldritch_invocations" TO "service_role";



GRANT ALL ON TABLE "public"."languages" TO "anon";
GRANT ALL ON TABLE "public"."languages" TO "authenticated";
GRANT ALL ON TABLE "public"."languages" TO "service_role";



GRANT ALL ON TABLE "public"."spell_translations" TO "anon";
GRANT ALL ON TABLE "public"."spell_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."spell_translations" TO "service_role";



GRANT ALL ON TABLE "public"."spells" TO "anon";
GRANT ALL ON TABLE "public"."spells" TO "authenticated";
GRANT ALL ON TABLE "public"."spells" TO "service_role";



GRANT ALL ON TABLE "public"."weapon_translations" TO "anon";
GRANT ALL ON TABLE "public"."weapon_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."weapon_translations" TO "service_role";



GRANT ALL ON TABLE "public"."weapons" TO "anon";
GRANT ALL ON TABLE "public"."weapons" TO "authenticated";
GRANT ALL ON TABLE "public"."weapons" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


