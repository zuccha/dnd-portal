--------------------------------------------------------------------------------
-- CREATURES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creatures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid DEFAULT gen_random_uuid() NOT NULL,
    type public.creature_type NOT NULL,
    alignment public.creature_alignment NOT NULL,
    size public.creature_size NOT NULL,
    cr numeric DEFAULT '0'::smallint NOT NULL,
    ac text DEFAULT ''::text NOT NULL,
    hp text DEFAULT ''::text NOT NULL,
    hp_formula text DEFAULT ''::text NOT NULL,
    speed_walk text,
    speed_fly text,
    speed_swim text,
    speed_climb text,
    ability_str smallint DEFAULT '10'::smallint NOT NULL,
    ability_dex smallint DEFAULT '10'::smallint NOT NULL,
    ability_con smallint DEFAULT '10'::smallint NOT NULL,
    ability_int smallint DEFAULT '10'::smallint NOT NULL,
    ability_wis smallint DEFAULT '10'::smallint NOT NULL,
    ability_cha smallint DEFAULT '10'::smallint NOT NULL,
    initiative text DEFAULT ''::text NOT NULL,
    passive_perception text DEFAULT ''::text NOT NULL,
    ability_proficiencies public.creature_ability[] NOT NULL,
    skill_proficiencies public.creature_skill[] NOT NULL,
    damage_immunities public.damage_type[] NOT NULL,
    damage_resistances public.damage_type[] NOT NULL,
    damage_vulnerabilities public.damage_type[] NOT NULL,
    condition_immunities public.creature_condition[] NOT NULL,
    condition_resistances public.creature_condition[] NOT NULL,
    condition_vulnerabilities public.creature_condition[] NOT NULL,
    habitats public.creature_habitat[] NOT NULL,
    treasures public.creature_treasure[] NOT NULL,
    visibility public.campaign_role DEFAULT 'game_master'::public.campaign_role NOT NULL,
    speed_burrow text,
    initiative_passive text DEFAULT ''::text NOT NULL,
    skill_expertise public.creature_skill[] DEFAULT '{}'::public.creature_skill[] NOT NULL,
    CONSTRAINT creature_pkey PRIMARY KEY (id),
    CONSTRAINT creature_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.creatures OWNER TO postgres;
ALTER TABLE public.creatures ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.creatures TO anon;
GRANT ALL ON TABLE public.creatures TO authenticated;
GRANT ALL ON TABLE public.creatures TO service_role;


--------------------------------------------------------------------------------
-- CREATURE TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creature_translations (
    creature_id uuid DEFAULT gen_random_uuid() NOT NULL,
    lang text NOT NULL,
    senses text,
    gear text,
    traits text,
    actions text,
    bonus_actions text,
    reactions text,
    legendary_actions text,
    planes text,
    name text NOT NULL,
    page text,
    languages text,
    CONSTRAINT creature_translations_pkey PRIMARY KEY (creature_id, lang),
    CONSTRAINT creature_translations_creature_id_fkey FOREIGN KEY (creature_id) REFERENCES public.creatures(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT creature_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.creature_translations OWNER TO postgres;
ALTER TABLE public.creature_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.creature_translations TO anon;
GRANT ALL ON TABLE public.creature_translations TO authenticated;
GRANT ALL ON TABLE public.creature_translations TO service_role;


--------------------------------------------------------------------------------
-- CAN READ CREATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_creature(p_campaign_id uuid, p_creature_visibility public.campaign_role) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid))
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() AS uid))
    WHERE c.id = p_campaign_id
      AND (
        -- Public modules
        (c.is_module = true AND c.visibility = 'public'::public.campaign_visibility)
        OR
        -- Owned modules
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        -- Non-module campaigns with visibility check
        (c.is_module = false AND cp.user_id IS NOT NULL AND (
          p_creature_visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  );
END;
$$;

ALTER FUNCTION public.can_read_creature(p_campaign_id uuid, p_creature_visibility public.campaign_role) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_creature(p_campaign_id uuid, p_creature_visibility public.campaign_role) TO anon;
GRANT ALL ON FUNCTION public.can_read_creature(p_campaign_id uuid, p_creature_visibility public.campaign_role) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_creature(p_campaign_id uuid, p_creature_visibility public.campaign_role) TO service_role;


--------------------------------------------------------------------------------
-- CAN READ CREATURE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_creature_translation(p_creature_id uuid) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN;
  SELECT can_read_creature(cr.campaign_id, cr.visibility)
  FROM public.creatures cr
  WHERE cr.id = p_creature_id;
END;
$$;

ALTER FUNCTION public.can_read_creature_translation(p_creature_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_creature_translation(p_creature_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_read_creature_translation(p_creature_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_creature_translation(p_creature_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN EDIT CREATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_edit_creature(p_campaign_id uuid) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid) AND um.role = 'creator'::public.module_role)
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() as uid) AND cp.role = 'game_master'::public.campaign_role)
    WHERE c.id = p_campaign_id
      AND (
        -- Module creators
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        -- Campaign GMs
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  );
END;
$$;

ALTER FUNCTION public.can_edit_creature(p_campaign_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_edit_creature(p_campaign_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_edit_creature(p_campaign_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_edit_creature(p_campaign_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN EDIT CREATURE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_edit_creature_translation(p_creature_id uuid) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  SELECT can_edit_creature(cr.campaign_id)
  FROM public.creatures cr
  WHERE cr.id = p_creature_id;
END;
$$;

ALTER FUNCTION public.can_edit_creature_translation(p_creature_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_edit_creature_translation(p_creature_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_edit_creature_translation(p_creature_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_edit_creature_translation(p_creature_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CREATURES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creatures"
ON public.creatures
FOR SELECT
TO authenticated
USING ( public.can_read_creature(campaign_id, visibility) OR public.can_edit_creature(campaign_id) );

CREATE POLICY "Creators and GMs can create new creatures"
ON public.creatures
FOR INSERT
TO authenticated
WITH CHECK ( public.can_edit_creature(campaign_id) );

CREATE POLICY "Creators and GMs can update creatures"
ON public.creatures
FOR UPDATE
TO authenticated
USING ( public.can_edit_creature(campaign_id) )
WITH CHECK ( public.can_edit_creature(campaign_id) );

CREATE POLICY "Creators and GMs can delete creatures"
ON public.creatures
FOR DELETE
TO authenticated
USING ( public.can_edit_creature(campaign_id) );


--------------------------------------------------------------------------------
-- CREATURE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creature translations"
ON public.creature_translations
FOR SELECT
TO authenticated
USING ( public.can_read_creature_translation(creature_id) OR public.can_edit_creature_translation(creature_id) );

CREATE POLICY "Creators and GMs can create new creature translations"
ON public.creature_translations
FOR INSERT
TO authenticated
WITH CHECK ( public.can_edit_creature_translation(creature_id) );

CREATE POLICY "Creators and GMs can update creature translations"
ON public.creature_translations
FOR UPDATE
TO authenticated
USING ( public.can_edit_creature_translation(creature_id) )
WITH CHECK ( public.can_edit_creature_translation(creature_id) );

CREATE POLICY "Creators and GMs can delete creature translations"
ON public.creature_translations
FOR DELETE
TO authenticated
USING ( public.can_edit_creature_translation(creature_id) );


--------------------------------------------------------------------------------
-- CREATE CREATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_creature(p_campaign_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) RETURNS uuid
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_id uuid;
  r public.creatures%ROWTYPE;
begin
  r := jsonb_populate_record(null::public.creatures, p_creature);

  insert into public.creatures (
    campaign_id, type, alignment, size, habitats, treasures, cr, ac, hp, hp_formula,
    speed_walk, speed_fly, speed_swim, speed_climb, speed_burrow,
    ability_str, ability_dex, ability_con, ability_int, ability_wis, ability_cha,
    initiative, initiative_passive, passive_perception, ability_proficiencies, skill_proficiencies, skill_expertise,
    damage_immunities, damage_resistances, damage_vulnerabilities,
    condition_immunities, condition_resistances, condition_vulnerabilities,
    visibility
  ) values (
    p_campaign_id, r.type, r.alignment, r.size, r.habitats, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
    r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb, r.speed_burrow,
    r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
    r.initiative, r.initiative_passive, r.passive_perception, r.ability_proficiencies, r.skill_proficiencies, r.skill_expertise,
    r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
    r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities,
    r.visibility
  )
  returning id into v_id;

  perform public.upsert_creature_translation(v_id, p_lang, p_creature_translation);

  return v_id;
end;
$$;

ALTER FUNCTION public.create_creature(p_campaign_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_creature(p_campaign_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_creature(p_campaign_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_creature(p_campaign_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CREATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_creature(p_id uuid) RETURNS record
    LANGUAGE sql
    SET search_path TO 'public', 'pg_temp'
    AS $$
  select
    r.id,
    r.campaign_id,
    c.name as campaign_name,
    r.type,
    r.alignment,
    r.size,
    r.habitats,
    r.treasures,
    r.cr,
    r.ac,
    r.hp,
    r.hp_formula,
    r.speed_burrow,
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
    r.initiative_passive,
    r.passive_perception,
    r.ability_proficiencies,
    r.skill_proficiencies,
    r.skill_expertise,
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

ALTER FUNCTION public.fetch_creature(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_creature(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_creature(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_creature(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CREATURES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text) RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, alignment public.creature_alignment, habitats public.creature_habitat[], size public.creature_size, treasures public.creature_treasure[], type public.creature_type, ac text, cr numeric, hp text, hp_formula text, speed_burrow text, speed_climb text, speed_fly text, speed_swim text, speed_walk text, ability_cha smallint, ability_con smallint, ability_dex smallint, ability_int smallint, ability_str smallint, ability_wis smallint, initiative text, initiative_passive text, passive_perception text, ability_proficiencies public.creature_ability[], skill_proficiencies public.creature_skill[], skill_expertise public.creature_skill[], damage_immunities public.damage_type[], damage_resistances public.damage_type[], damage_vulnerabilities public.damage_type[], condition_immunities public.creature_condition[], condition_resistances public.creature_condition[], condition_vulnerabilities public.creature_condition[], name jsonb, page jsonb, gear jsonb, languages jsonb, planes jsonb, senses jsonb, traits jsonb, actions jsonb, bonus_actions jsonb, legendary_actions jsonb, reactions jsonb, visibility public.campaign_role)
    LANGUAGE sql
    SET search_path TO 'public', 'pg_temp'
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
$$;

ALTER FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT CREATURE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_creature_translation(p_id uuid, p_lang text, p_creature_translation jsonb) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
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

ALTER FUNCTION public.upsert_creature_translation(p_id uuid, p_lang text, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_creature_translation(p_id uuid, p_lang text, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_creature_translation(p_id uuid, p_lang text, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_creature_translation(p_id uuid, p_lang text, p_creature_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE CREATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_rows int;
begin
  update public.creatures c
  set (
    type, alignment, size, habitats, treasures, cr, ac, hp, hp_formula,
    speed_walk, speed_fly, speed_swim, speed_climb, speed_burrow,
    ability_str, ability_dex, ability_con, ability_int, ability_wis, ability_cha,
    initiative, initiative_passive, passive_perception, ability_proficiencies, skill_proficiencies, skill_expertise,
    damage_immunities, damage_resistances, damage_vulnerabilities,
    condition_immunities, condition_resistances, condition_vulnerabilities,
    visibility
  ) = (
    select r.type, r.alignment, r.size, r.habitats, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
      r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb, r.speed_burrow,
      r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
      r.initiative, r.initiative_passive, r.passive_perception, r.ability_proficiencies, r.skill_proficiencies, r.skill_expertise,
      r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
      r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities,
      r.visibility
    from jsonb_populate_record(null::public.creatures, to_jsonb(c) || p_creature) as r
  )
  where c.id = p_id;

  get diagnostics v_rows = ROW_COUNT;
  if v_rows = 0 then
    raise exception 'No row with id %', p_id;
  end if;

  perform public.upsert_creature_translation(p_id, p_lang, p_creature_translation);
end;
$$;

ALTER FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO service_role;
