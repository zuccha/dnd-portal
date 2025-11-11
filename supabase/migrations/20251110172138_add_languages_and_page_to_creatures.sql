-- Add languages and page fields to creature translations and update RPC functions

-- Add languages field to creature_translations table
ALTER TABLE "public"."creature_translations"
ADD COLUMN "languages" "text";

-- Remove function, since we change it's return type
DROP FUNCTION "public"."fetch_creatures"(uuid, text[], jsonb, text, text);

-- Update fetch_creatures RPC function to include languages field
CREATE OR REPLACE FUNCTION "public"."fetch_creatures"(
  "p_campaign_id" "uuid",
  "p_langs" "text"[],
  "p_filters" "jsonb" DEFAULT '{}'::"jsonb",
  "p_order_by" "text" DEFAULT 'name'::"text",
  "p_order_dir" "text" DEFAULT 'asc'::"text"
) RETURNS TABLE(
  "id" "uuid",
  "campaign_id" "uuid",
  "campaign_name" "text",
  "alignment" "public"."creature_alignment",
  "habitat" "public"."creature_habitat"[],
  "size" "public"."creature_size",
  "treasures" "public"."creature_treasure"[],
  "type" "public"."creature_type",
  "ac" "text",
  "cr" numeric,
  "hp" "text",
  "hp_formula" "text",
  "speed_climb" "text",
  "speed_fly" "text",
  "speed_swim" "text",
  "speed_walk" "text",
  "ability_cha" smallint,
  "ability_con" smallint,
  "ability_dex" smallint,
  "ability_int" smallint,
  "ability_str" smallint,
  "ability_wis" smallint,
  "initiative" "text",
  "passive_perception" "text",
  "ability_proficiencies" "public"."creature_ability"[],
  "skill_proficiencies" "public"."creature_skill"[],
  "damage_immunities" "public"."damage_type"[],
  "damage_resistances" "public"."damage_type"[],
  "damage_vulnerabilities" "public"."damage_type"[],
  "condition_immunities" "public"."creature_condition"[],
  "condition_resistances" "public"."creature_condition"[],
  "condition_vulnerabilities" "public"."creature_condition"[],
  "name" "jsonb",
  "page" "jsonb",
  "gear" "jsonb",
  "languages" "jsonb",
  "planes" "jsonb",
  "senses" "jsonb",
  "traits" "jsonb",
  "actions" "jsonb",
  "bonus_actions" "jsonb",
  "legendary_actions" "jsonb",
  "reactions" "jsonb",
  "visibility" "public"."campaign_role"
)
LANGUAGE "sql"
SET "search_path" TO 'public', 'pg_temp'
AS $$
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

    -- habitat
    (
      select coalesce(array_agg(lower(e.key)::public.creature_habitat), null)
      from jsonb_each_text(p_filters->'habitat') as e(key, value)
      where e.value = 'true'
    ) as habitat_inc,
    (
      select coalesce(array_agg(lower(e.key)::public.creature_habitat), null)
      from jsonb_each_text(p_filters->'habitat') as e(key, value)
      where e.value = 'false'
    ) as habitat_exc,

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
    --  or cmp.core = true
),
filtered as (
  select c.*
  from src c, prefs p
  where
    -- types
        (p.types_inc is null or c.type = any(p.types_inc))
    and (p.types_exc is null or not (c.type = any(p.types_exc)))

    -- habitat (array overlap)
    and (p.habitat_inc is null or c.habitat && p.habitat_inc)
    and (p.habitat_exc is null or not (c.habitat && p.habitat_exc))

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
    jsonb_object_agg(t.lang, t.name)              filter (where array_length(p_langs,1) is null or t.lang = any(p_langs)) as name,
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
  f.habitat,
  f.size,
  f.treasures,
  f.type,
  f.ac,
  f.cr,
  f.hp,
  f.hp_formula,
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
$$;

-- Update fetch_creature to include page and languages
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
    coalesce(tt.page,              '{}'::jsonb)  as page,
    coalesce(tt.gear,              '{}'::jsonb)  as gear,
    coalesce(tt.languages,         '{}'::jsonb)  as languages,
    coalesce(tt.planes,            '{}'::jsonb)  as planes,
    coalesce(tt.senses,            '{}'::jsonb)  as senses,
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
      jsonb_object_agg(t.lang, t.page)              as page,
      jsonb_object_agg(t.lang, t.gear)              as gear,
      jsonb_object_agg(t.lang, t.languages)         as languages,
      jsonb_object_agg(t.lang, t.planes)            as planes,
      jsonb_object_agg(t.lang, t.senses)            as senses,
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

-- Update upsert_creature_translation to include page and languages
CREATE OR REPLACE FUNCTION "public"."upsert_creature_translation"("p_id" "uuid", "p_lang" "text", "p_creature_translation" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  r public.creature_translations%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.creature_translations, p_creature_translation);

  insert into public.creature_translations as ct (
    creature_id, lang, name, page, gear, languages, planes, senses,
    traits, actions, bonus_actions, reactions, legendary_actions
  ) values (
    p_id, p_lang, r.name, r.page, r.gear, r.languages, r.planes, r.senses,
    r.traits, r.actions, r.bonus_actions, r.reactions, r.legendary_actions
  )
  on conflict (creature_id, lang) do update
  set
    name = excluded.name,
    page = excluded.page,
    gear = excluded.gear,
    languages = excluded.languages,
    planes = excluded.planes,
    senses = excluded.senses,
    traits = excluded.traits,
    actions = excluded.actions,
    bonus_actions = excluded.bonus_actions,
    reactions = excluded.reactions,
    legendary_actions = excluded.legendary_actions;
end;
$$;
