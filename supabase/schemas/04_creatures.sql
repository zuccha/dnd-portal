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
-- CAN READ CREATURE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_creature_translation(p_creature_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT can_read_campaign_resource(cr.campaign_id, cr.visibility)
  FROM public.creatures cr
  WHERE cr.id = p_creature_id;
$$;

ALTER FUNCTION public.can_read_creature_translation(p_creature_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_creature_translation(p_creature_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_read_creature_translation(p_creature_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_creature_translation(p_creature_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN EDIT CREATURE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_edit_creature_translation(p_creature_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT can_edit_campaign_resource(cr.campaign_id)
  FROM public.creatures cr
  WHERE cr.id = p_creature_id;
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
FOR SELECT TO authenticated
USING (public.can_read_campaign_resource(campaign_id, visibility) OR public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can create new creatures"
ON public.creatures
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can update creatures"
ON public.creatures
FOR UPDATE TO authenticated
USING (public.can_edit_campaign_resource(campaign_id))
WITH CHECK (public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can delete creatures"
ON public.creatures
FOR DELETE TO authenticated
USING (public.can_edit_campaign_resource(campaign_id));


--------------------------------------------------------------------------------
-- CREATURE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creature translations"
ON public.creature_translations
FOR SELECT TO authenticated
USING (public.can_read_creature_translation(creature_id) OR public.can_edit_creature_translation(creature_id));

CREATE POLICY "Creators and GMs can create new creature translations"
ON public.creature_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_creature_translation(creature_id));

CREATE POLICY "Creators and GMs can update creature translations"
ON public.creature_translations
FOR UPDATE TO authenticated
USING (public.can_edit_creature_translation(creature_id))
WITH CHECK (public.can_edit_creature_translation(creature_id));

CREATE POLICY "Creators and GMs can delete creature translations"
ON public.creature_translations
FOR DELETE TO authenticated
USING (public.can_edit_creature_translation(creature_id));


--------------------------------------------------------------------------------
-- CREATE CREATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_creature(
  p_campaign_id uuid,
  p_lang text,
  p_creature jsonb,
  p_creature_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.creatures%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.creatures, p_creature);

  INSERT INTO public.creatures (
    campaign_id, type, alignment, size, habitats, treasures, cr, ac, hp, hp_formula,
    speed_walk, speed_fly, speed_swim, speed_climb, speed_burrow,
    ability_str, ability_dex, ability_con, ability_int, ability_wis, ability_cha,
    initiative, initiative_passive, passive_perception, ability_proficiencies, skill_proficiencies, skill_expertise,
    damage_immunities, damage_resistances, damage_vulnerabilities,
    condition_immunities, condition_resistances, condition_vulnerabilities,
    visibility
  ) VALUES (
    p_campaign_id, r.type, r.alignment, r.size, r.habitats, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
    r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb, r.speed_burrow,
    r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
    r.initiative, r.initiative_passive, r.passive_perception, r.ability_proficiencies, r.skill_proficiencies, r.skill_expertise,
    r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
    r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities,
    r.visibility
  )
  RETURNING id INTO v_id;

  perform public.upsert_creature_translation(v_id, p_lang, p_creature_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_creature(p_campaign_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_creature(p_campaign_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_creature(p_campaign_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_creature(p_campaign_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CREATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_creature(p_id uuid)
RETURNS record
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.id,
    r.campaign_id,
    c.name                                       AS campaign_name,
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
    coalesce(tt.name,              '{}'::jsonb)  AS name,
    coalesce(tt.page,              '{}'::jsonb)  AS page,
    coalesce(tt.gear,              '{}'::jsonb)  AS gear,
    coalesce(tt.languages,         '{}'::jsonb)  AS languages,
    coalesce(tt.planes,            '{}'::jsonb)  AS planes,
    coalesce(tt.senses,            '{}'::jsonb)  AS senses,
    coalesce(tt.traits,            '{}'::jsonb)  AS traits,
    coalesce(tt.actions,           '{}'::jsonb)  AS actions,
    coalesce(tt.bonus_actions,     '{}'::jsonb)  AS bonus_actions,
    coalesce(tt.reactions,         '{}'::jsonb)  AS reactions,
    coalesce(tt.legendary_actions, '{}'::jsonb)  AS legendary_actions
  FROM public.creatures r
  JOIN public.campaigns c ON c.id = r.campaign_id
  LEFT JOIN (
    SELECT
      r.id,
      jsonb_object_agg(t.lang, t.name)              AS name,
      jsonb_object_agg(t.lang, t.page)              AS page,
      jsonb_object_agg(t.lang, t.gear)              AS gear,
      jsonb_object_agg(t.lang, t.languages)         AS languages,
      jsonb_object_agg(t.lang, t.planes)            AS planes,
      jsonb_object_agg(t.lang, t.senses)            AS senses,
      jsonb_object_agg(t.lang, t.traits)            AS traits,
      jsonb_object_agg(t.lang, t.actions)           AS actions,
      jsonb_object_agg(t.lang, t.bonus_actions)     AS bonus_actions,
      jsonb_object_agg(t.lang, t.reactions)         AS reactions,
      jsonb_object_agg(t.lang, t.legendary_actions) AS legendary_actions
    FROM public.creatures r
    LEFT JOIN public.creature_translations t ON t.creature_id = r.id
    WHERE r.id = p_id
    GROUP BY r.id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_creature(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_creature(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_creature(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_creature(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CREATURES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_creatures(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS TABLE(id uuid,
campaign_id uuid,
campaign_name text,
alignment public.creature_alignment,
habitats public.creature_habitat[],
size public.creature_size,
treasures public.creature_treasure[],
type public.creature_type,
ac text,
cr numeric,
hp text,
hp_formula text,
speed_burrow text,
speed_climb text,
speed_fly text,
speed_swim text,
speed_walk text,
ability_cha smallint,
ability_con smallint,
ability_dex smallint,
ability_int smallint,
ability_str smallint,
ability_wis smallint,
initiative text,
initiative_passive text,
passive_perception text,
ability_proficiencies public.creature_ability[],
skill_proficiencies public.creature_skill[],
skill_expertise public.creature_skill[],
damage_immunities public.damage_type[],
damage_resistances public.damage_type[],
damage_vulnerabilities public.damage_type[],
condition_immunities public.creature_condition[],
condition_resistances public.creature_condition[],
condition_vulnerabilities public.creature_condition[],
name jsonb,
page jsonb,
gear jsonb,
languages jsonb,
planes jsonb,
senses jsonb,
traits jsonb,
actions jsonb,
bonus_actions jsonb,
legendary_actions jsonb,
reactions jsonb,
visibility public.campaign_role)
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

ALTER FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_creatures(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT CREATURE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_creature_translation(
  p_id uuid,
  p_lang text,
  p_creature_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.creature_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.creature_translations, p_creature_translation);

  INSERT INTO public.creature_translations AS ct (
    creature_id, lang, name, page, gear, languages, planes, senses,
    traits, actions, bonus_actions, reactions, legendary_actions
  ) VALUES (
    p_id, p_lang, r.name, r.page, r.gear, r.languages, r.planes, r.senses,
    r.traits, r.actions, r.bonus_actions, r.reactions, r.legendary_actions
  )
  ON conflict (creature_id, lang) DO UPDATE
  SET
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
END;
$$;

ALTER FUNCTION public.upsert_creature_translation(p_id uuid, p_lang text, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_creature_translation(p_id uuid, p_lang text, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_creature_translation(p_id uuid, p_lang text, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_creature_translation(p_id uuid, p_lang text, p_creature_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE CREATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_creature(
  p_id uuid,
  p_lang text,
  p_creature jsonb,
  p_creature_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.creatures c
  SET (
    type, alignment, size, habitats, treasures, cr, ac, hp, hp_formula,
    speed_walk, speed_fly, speed_swim, speed_climb, speed_burrow,
    ability_str, ability_dex, ability_con, ability_int, ability_wis, ability_cha,
    initiative, initiative_passive, passive_perception, ability_proficiencies, skill_proficiencies, skill_expertise,
    damage_immunities, damage_resistances, damage_vulnerabilities,
    condition_immunities, condition_resistances, condition_vulnerabilities,
    visibility
  ) = (
    SELECT r.type, r.alignment, r.size, r.habitats, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
      r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb, r.speed_burrow,
      r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
      r.initiative, r.initiative_passive, r.passive_perception, r.ability_proficiencies, r.skill_proficiencies, r.skill_expertise,
      r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
      r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities,
      r.visibility
    FROM jsonb_populate_record(null::public.creatures, to_jsonb(c) || p_creature) as r
  )
  WHERE c.id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_creature_translation(p_id, p_lang, p_creature_translation);
END;
$$;

ALTER FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO service_role;
