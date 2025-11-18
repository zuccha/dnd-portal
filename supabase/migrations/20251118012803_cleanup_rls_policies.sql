drop policy "Users can check if they joined a campaign" on "public"."campaign_players";

drop policy "Players can read campaigns they joined" on "public"."campaigns";

drop policy "Players can read modules they own" on "public"."campaigns";

drop policy "Players can read public modules" on "public"."campaigns";

drop policy "GMs can manipulate creatures in their campaigns" on "public"."creature_translations";

drop policy "Players can read creatures from owned modules" on "public"."creature_translations";

drop policy "Players can read creatures from public modules" on "public"."creature_translations";

drop policy "Players can read public creatures from their campaigns" on "public"."creature_translations";

drop policy "GMs can manipulate creatures in their campaigns" on "public"."creatures";

drop policy "Players can read creatures from owned modules" on "public"."creatures";

drop policy "Players can read creatures from public modules" on "public"."creatures";

drop policy "Players can read public creatures from their campaigns" on "public"."creatures";

drop policy "GMs can manipulate eldritch invocations in their campaigns" on "public"."eldritch_invocation_translations";

drop policy "Players can read eldritch invocations from owned modules" on "public"."eldritch_invocation_translations";

drop policy "Players can read eldritch invocations from public modules" on "public"."eldritch_invocation_translations";

drop policy "Players can read public eldritch invocations from campaigns the" on "public"."eldritch_invocation_translations";

drop policy "GMs can manipulate eldritch invocations in their campaigns" on "public"."eldritch_invocations";

drop policy "Players can read eldritch invocations from owned modules" on "public"."eldritch_invocations";

drop policy "Players can read eldritch invocations from public modules" on "public"."eldritch_invocations";

drop policy "Players can read public eldritch invocations from campaigns the" on "public"."eldritch_invocations";

drop policy "GMs can manipulate spells in their campaigns" on "public"."spell_translations";

drop policy "Players can read public spells from campaigns they joined" on "public"."spell_translations";

drop policy "Players can read spells from owned modules" on "public"."spell_translations";

drop policy "Players can read spells from public modules" on "public"."spell_translations";

drop policy "GMs can manipulate spells in their campaigns" on "public"."spells";

drop policy "Players can read public spells from campaigns they joined" on "public"."spells";

drop policy "Players can read spells from owned modules" on "public"."spells";

drop policy "Players can read spells from public modules" on "public"."spells";

drop policy "Creators can manage module ownership" on "public"."user_modules";

drop policy "Creators can revoke module ownership" on "public"."user_modules";

drop policy "GMs can manipulate weapons in their campaigns" on "public"."weapon_translations";

drop policy "Players can read public weapons from campaigns they joined" on "public"."weapon_translations";

drop policy "Players can read weapons from owned modules" on "public"."weapon_translations";

drop policy "Players can read weapons from public modules" on "public"."weapon_translations";

drop policy "GMs can manipulate weapons in their campaigns" on "public"."weapons";

drop policy "Players can read public weapons from campaigns they joined" on "public"."weapons";

drop policy "Players can read weapons from owned modules" on "public"."weapons";

drop policy "Players can read weapons from public modules" on "public"."weapons";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, alignment public.creature_alignment, habitats public.creature_habitat[], size public.creature_size, treasures public.creature_treasure[], type public.creature_type, ac text, cr numeric, hp text, hp_formula text, speed_burrow text, speed_climb text, speed_fly text, speed_swim text, speed_walk text, ability_cha smallint, ability_con smallint, ability_dex smallint, ability_int smallint, ability_str smallint, ability_wis smallint, initiative text, initiative_passive text, passive_perception text, ability_proficiencies public.creature_ability[], skill_proficiencies public.creature_skill[], skill_expertise public.creature_skill[], damage_immunities public.damage_type[], damage_resistances public.damage_type[], damage_vulnerabilities public.damage_type[], condition_immunities public.creature_condition[], condition_resistances public.creature_condition[], condition_vulnerabilities public.creature_condition[], name jsonb, page jsonb, gear jsonb, languages jsonb, planes jsonb, senses jsonb, traits jsonb, actions jsonb, bonus_actions jsonb, legendary_actions jsonb, reactions jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
with prefs as (
  select
    -- types
    (
      select coalesce(array_agg(lower(e.key)::public.creature_type), null)
      from jsonb_each_text(p_filters->'types') as e(key, value)
      where e.value = 'true'
    ) as types_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.creature_type), null)
      from jsonb_each_text(p_filters->'types') as e(key, value)
      where e.value = 'false'
    ) as types_exc,

    -- habitats
    (
      select coalesce(array_agg(lower(e.key)::public.creature_habitat), null)
      from jsonb_each_text(p_filters->'habitats') as e(key, value)
      where e.value = 'true'
    ) as habitats_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.creature_habitat), null)
      from jsonb_each_text(p_filters->'habitats') as e(key, value)
      where e.value = 'false'
    ) as habitats_exc,

    -- treasures
    (
      select coalesce(array_agg(lower(e.key)::public.creature_treasure), null)
      from jsonb_each_text(p_filters->'treasures') as e(key, value)
      where e.value = 'true'
    ) as treasures_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.creature_treasure), null)
      from jsonb_each_text(p_filters->'treasures') as e(key, value)
      where e.value = 'false'
    ) as treasures_exc,

    -- alignment
    (
      select coalesce(array_agg(lower(e.key)::public.creature_alignment), null)
      from jsonb_each_text(p_filters->'alignment') as e(key, value)
      where e.value = 'true'
    ) as alignment_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.creature_alignment), null)
      from jsonb_each_text(p_filters->'alignment') as e(key, value)
      where e.value = 'false'
    ) as alignment_exc,

    -- size
    (
      select coalesce(array_agg(lower(e.key)::public.creature_size), null)
      from jsonb_each_text(p_filters->'size') as e(key, value)
      where e.value = 'true'
    ) as size_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.creature_size), null)
      from jsonb_each_text(p_filters->'size') as e(key, value)
      where e.value = 'false'
    ) as size_exc,

    -- CR range
    coalesce((p_filters->>'cr_min')::numeric, 0) as cr_min,
    coalesce((p_filters->>'cr_max')::numeric, 30) as cr_max
),
src as (
  select c.*
  from public.creatures c
  join public.campaigns cmp on cmp.id = c.campaign_id
  where c.campaign_id = p_campaign_id
),
filtered as (
  select c.*
  from src c, prefs p
  where
    -- types
        (p.types_inc is null or c.type = any(p.types_inc))
    and (p.types_exc is null or not (c.type = any(p.types_exc)))

    -- habitats (array overlap)
    and (p.habitats_inc is null or c.habitats && p.habitats_inc)
    and (p.habitats_exc is null or not (c.habitats && p.habitats_exc))

    -- treasures (array overlap)
    and (p.treasures_inc is null or c.treasures && p.treasures_inc)
    and (p.treasures_exc is null or not (c.treasures && p.treasures_exc))

    -- alignment
    and (p.alignment_inc is null or c.alignment = any(p.alignment_inc))
    and (p.alignment_exc is null or not (c.alignment = any(p.alignment_exc)))

    -- size
    and (p.size_inc is null or c.size = any(p.size_inc))
    and (p.size_exc is null or not (c.size = any(p.size_exc)))

    -- CR range
    and c.cr >= p.cr_min
    and c.cr <= p.cr_max
),
t as (
  select
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                as name,
    jsonb_object_agg(t.lang, t.page)              filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as page,
    jsonb_object_agg(t.lang, t.gear)              filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as gear,
    jsonb_object_agg(t.lang, t.languages)         filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as languages,
    jsonb_object_agg(t.lang, t.planes)            filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as planes,
    jsonb_object_agg(t.lang, t.senses)            filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as senses,
    jsonb_object_agg(t.lang, t.traits)            filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as traits,
    jsonb_object_agg(t.lang, t.actions)           filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as actions,
    jsonb_object_agg(t.lang, t.bonus_actions)     filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as bonus_actions,
    jsonb_object_agg(t.lang, t.legendary_actions) filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as legendary_actions,
    jsonb_object_agg(t.lang, t.reactions)         filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as reactions
  from filtered f
  left join public.creature_translations t on t.creature_id = f.id
  left join (select 1) _ on true  -- keep p_langs in scope
  group by f.id
)
select
  f.id,
  f.campaign_id,
  cmp.name                                      as campaign_name,
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
  coalesce(tt.name, '{}'::jsonb)              as name,
  coalesce(tt.page, '{}'::jsonb)              as page,
  coalesce(tt.gear, '{}'::jsonb)              as gear,
  coalesce(tt.languages, '{}'::jsonb)         as languages,
  coalesce(tt.planes, '{}'::jsonb)            as planes,
  coalesce(tt.senses, '{}'::jsonb)            as senses,
  coalesce(tt.traits, '{}'::jsonb)            as traits,
  coalesce(tt.actions, '{}'::jsonb)           as actions,
  coalesce(tt.bonus_actions, '{}'::jsonb)     as bonus_actions,
  coalesce(tt.legendary_actions, '{}'::jsonb) as legendary_actions,
  coalesce(tt.reactions, '{}'::jsonb)         as reactions,
  f.visibility
from filtered f
join public.campaigns cmp on cmp.id = f.campaign_id
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, min_warlock_level smallint, name jsonb, prerequisite jsonb, description jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
with prefs as (
  select coalesce( (p_filters->>'warlock_level')::int, 20 ) as warlock_level
),
src as (
  select e.*
  from public.eldritch_invocations e
  join public.campaigns c on c.id = e.campaign_id
  where e.campaign_id = p_campaign_id
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_spells(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, level smallint, character_classes public.character_class[], school public.spell_school, casting_time public.spell_casting_time, casting_time_value text, duration public.spell_duration, duration_value text, range public.spell_range, range_value_imp text, range_value_met text, concentration boolean, ritual boolean, somatic boolean, verbal boolean, material boolean, name jsonb, description jsonb, materials jsonb, page jsonb, upgrade jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_weapons(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, type public.weapon_type, damage text, damage_type public.damage_type, damage_versatile text, mastery public.weapon_mastery, properties public.weapon_property[], magic boolean, melee boolean, ranged boolean, range_ft_long real, range_ft_short real, range_m_long real, range_m_short real, weight_kg real, weight_lb real, cost real, name jsonb, notes jsonb, page jsonb, ammunition jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;


  create policy "GMs can manage campaign memberships"
  on "public"."campaign_players"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.campaign_players cp
  WHERE ((cp.campaign_id = campaign_players.campaign_id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role)))));



  create policy "Users can view their campaign memberships"
  on "public"."campaign_players"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Creators and GMs can edit campaigns"
  on "public"."campaigns"
  as permissive
  for all
  to authenticated
using ((((is_module = true) AND (EXISTS ( SELECT 1
   FROM public.user_modules um
  WHERE ((um.module_id = campaigns.id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role))))) OR ((is_module = false) AND (EXISTS ( SELECT 1
   FROM public.campaign_players cp
  WHERE ((cp.campaign_id = campaigns.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role)))))));



  create policy "Users can read campaigns and modules"
  on "public"."campaigns"
  as permissive
  for select
  to authenticated
using ((((is_module = true) AND ((visibility = ANY (ARRAY['public'::public.campaign_visibility, 'purchasable'::public.campaign_visibility])) OR (EXISTS ( SELECT 1
   FROM public.user_modules um
  WHERE ((um.module_id = campaigns.id) AND (um.user_id = ( SELECT auth.uid() AS uid))))))) OR ((is_module = false) AND (EXISTS ( SELECT 1
   FROM public.campaign_players cp
  WHERE ((cp.campaign_id = campaigns.id) AND (cp.user_id = ( SELECT auth.uid() AS uid))))))));



  create policy "Creators and GMs can edit creature translations"
  on "public"."creature_translations"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (((public.creatures cr
     JOIN public.campaigns c ON ((c.id = cr.campaign_id)))
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role))))
  WHERE ((cr.id = creature_translations.creature_id) AND (((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL)))))));



  create policy "Users can read creature translations"
  on "public"."creature_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (((public.creatures cr
     JOIN public.campaigns c ON ((c.id = cr.campaign_id)))
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)))))
  WHERE ((cr.id = creature_translations.creature_id) AND (((c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)) OR ((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL) AND ((cr.visibility = 'player'::public.campaign_role) OR (cp.role = 'game_master'::public.campaign_role))))))));



  create policy "Creators and GMs can edit creatures"
  on "public"."creatures"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.campaigns c
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role))))
  WHERE ((c.id = creatures.campaign_id) AND (((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL)))))));



  create policy "Users can read creatures"
  on "public"."creatures"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.campaigns c
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)))))
  WHERE ((c.id = creatures.campaign_id) AND (((c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)) OR ((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL) AND ((creatures.visibility = 'player'::public.campaign_role) OR (cp.role = 'game_master'::public.campaign_role))))))));



  create policy "Creators and GMs can edit eldritch invocation translations"
  on "public"."eldritch_invocation_translations"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (((public.eldritch_invocations ei
     JOIN public.campaigns c ON ((c.id = ei.campaign_id)))
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role))))
  WHERE ((ei.id = eldritch_invocation_translations.eldritch_invocation_id) AND (((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL)))))));



  create policy "Users can read eldritch invocation translations"
  on "public"."eldritch_invocation_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (((public.eldritch_invocations ei
     JOIN public.campaigns c ON ((c.id = ei.campaign_id)))
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)))))
  WHERE ((ei.id = eldritch_invocation_translations.eldritch_invocation_id) AND (((c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)) OR ((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL) AND ((ei.visibility = 'player'::public.campaign_role) OR (cp.role = 'game_master'::public.campaign_role))))))));



  create policy "Creators and GMs can edit eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.campaigns c
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role))))
  WHERE ((c.id = eldritch_invocations.campaign_id) AND (((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL)))))));



  create policy "Users can read eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.campaigns c
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)))))
  WHERE ((c.id = eldritch_invocations.campaign_id) AND (((c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)) OR ((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL) AND ((eldritch_invocations.visibility = 'player'::public.campaign_role) OR (cp.role = 'game_master'::public.campaign_role))))))));



  create policy "Creators and GMs can edit spell translations"
  on "public"."spell_translations"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (((public.spells sp
     JOIN public.campaigns c ON ((c.id = sp.campaign_id)))
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role))))
  WHERE ((sp.id = spell_translations.spell_id) AND (((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL)))))));



  create policy "Users can read spell translations"
  on "public"."spell_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (((public.spells sp
     JOIN public.campaigns c ON ((c.id = sp.campaign_id)))
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)))))
  WHERE ((sp.id = spell_translations.spell_id) AND (((c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)) OR ((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL) AND ((sp.visibility = 'player'::public.campaign_role) OR (cp.role = 'game_master'::public.campaign_role))))))));



  create policy "Creators and GMs can edit spells"
  on "public"."spells"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.campaigns c
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role))))
  WHERE ((c.id = spells.campaign_id) AND (((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL)))))));



  create policy "Users can read spells"
  on "public"."spells"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.campaigns c
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)))))
  WHERE ((c.id = spells.campaign_id) AND (((c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)) OR ((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL) AND ((spells.visibility = 'player'::public.campaign_role) OR (cp.role = 'game_master'::public.campaign_role))))))));



  create policy "Module creators can manage ownership"
  on "public"."user_modules"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.user_modules um
  WHERE ((um.module_id = user_modules.module_id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role)))));



  create policy "Creators and GMs can edit weapon translations"
  on "public"."weapon_translations"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (((public.weapons w
     JOIN public.campaigns c ON ((c.id = w.campaign_id)))
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role))))
  WHERE ((w.id = weapon_translations.weapon_id) AND (((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL)))))));



  create policy "Users can read weapon translations"
  on "public"."weapon_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (((public.weapons w
     JOIN public.campaigns c ON ((c.id = w.campaign_id)))
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)))))
  WHERE ((w.id = weapon_translations.weapon_id) AND (((c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)) OR ((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL) AND ((w.visibility = 'player'::public.campaign_role) OR (cp.role = 'game_master'::public.campaign_role))))))));



  create policy "Creators and GMs can edit weapons"
  on "public"."weapons"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.campaigns c
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role))))
  WHERE ((c.id = weapons.campaign_id) AND (((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL)))))));



  create policy "Users can read weapons"
  on "public"."weapons"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.campaigns c
     LEFT JOIN public.user_modules um ON (((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)))))
     LEFT JOIN public.campaign_players cp ON (((cp.campaign_id = c.id) AND (cp.user_id = ( SELECT auth.uid() AS uid)))))
  WHERE ((c.id = weapons.campaign_id) AND (((c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)) OR ((c.is_module = true) AND (um.user_id IS NOT NULL)) OR ((c.is_module = false) AND (cp.user_id IS NOT NULL) AND ((weapons.visibility = 'player'::public.campaign_role) OR (cp.role = 'game_master'::public.campaign_role))))))));



