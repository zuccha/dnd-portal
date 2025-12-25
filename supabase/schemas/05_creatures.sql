--------------------------------------------------------------------------------
-- CREATURES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.creatures (
  resource_id uuid NOT NULL,
  ability_cha smallint DEFAULT '10'::smallint NOT NULL,
  ability_con smallint DEFAULT '10'::smallint NOT NULL,
  ability_dex smallint DEFAULT '10'::smallint NOT NULL,
  ability_int smallint DEFAULT '10'::smallint NOT NULL,
  ability_proficiencies public.creature_ability[] NOT NULL,
  ability_str smallint DEFAULT '10'::smallint NOT NULL,
  ability_wis smallint DEFAULT '10'::smallint NOT NULL,
  ac smallint DEFAULT '0'::smallint NOT NULL,
  alignment public.creature_alignment NOT NULL,
  condition_immunities public.creature_condition[] NOT NULL,
  condition_resistances public.creature_condition[] NOT NULL,
  condition_vulnerabilities public.creature_condition[] NOT NULL,
  cr numeric DEFAULT '0'::smallint NOT NULL,
  damage_immunities public.damage_type[] NOT NULL,
  damage_resistances public.damage_type[] NOT NULL,
  damage_vulnerabilities public.damage_type[] NOT NULL,
  habitats public.creature_habitat[] NOT NULL,
  hp smallint DEFAULT '10'::smallint NOT NULL,
  hp_formula text DEFAULT ''::text NOT NULL,
  initiative smallint DEFAULT '0'::smallint NOT NULL,
  passive_perception smallint DEFAULT '0'::smallint NOT NULL,
  size public.creature_size NOT NULL,
  skill_expertise public.creature_skill[] DEFAULT '{}'::public.creature_skill[] NOT NULL,
  skill_proficiencies public.creature_skill[] NOT NULL,
  speed_burrow integer DEFAULT '0'::integer NOT NULL,
  speed_climb integer DEFAULT '0'::integer NOT NULL,
  speed_fly integer DEFAULT '0'::integer NOT NULL,
  speed_swim integer DEFAULT '0'::integer NOT NULL,
  speed_walk integer DEFAULT '0'::integer NOT NULL,
  treasures public.creature_treasure[] NOT NULL,
  type public.creature_type NOT NULL,
  CONSTRAINT creature_pkey PRIMARY KEY (resource_id),
  CONSTRAINT creature_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
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
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  actions text,
  bonus_actions text,
  gear text,
  languages text,
  legendary_actions text,
  planes text,
  reactions text,
  senses text,
  traits text,
  CONSTRAINT creature_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT creature_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.creatures(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT creature_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.creature_translations OWNER TO postgres;
ALTER TABLE public.creature_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.creature_translations TO anon;
GRANT ALL ON TABLE public.creature_translations TO authenticated;
GRANT ALL ON TABLE public.creature_translations TO service_role;


--------------------------------------------------------------------------------
-- CREATURE ROW
--------------------------------------------------------------------------------

CREATE TYPE public.creature_row AS (
  -- Resource
  campaign_id uuid,
  campaign_name text,
  id uuid,
  kind public.resource_kind,
  visibility public.campaign_role,
  name jsonb,
  page jsonb,
  -- Creature
  ac smallint,
  ability_cha smallint,
  ability_con smallint,
  ability_dex smallint,
  ability_int smallint,
  ability_str smallint,
  ability_wis smallint,
  ability_proficiencies public.creature_ability[],
  alignment public.creature_alignment,
  condition_immunities public.creature_condition[],
  condition_resistances public.creature_condition[],
  condition_vulnerabilities public.creature_condition[],
  cr numeric,
  damage_immunities public.damage_type[],
  damage_resistances public.damage_type[],
  damage_vulnerabilities public.damage_type[],
  habitats public.creature_habitat[],
  hp smallint,
  hp_formula text,
  initiative smallint,
  passive_perception smallint,
  size public.creature_size,
  skill_expertise public.creature_skill[],
  skill_proficiencies public.creature_skill[],
  speed_burrow integer,
  speed_climb integer,
  speed_fly integer,
  speed_swim integer,
  speed_walk integer,
  treasures public.creature_treasure[],
  type public.creature_type,
  -- Creature Translation
  actions jsonb,
  bonus_actions jsonb,
  gear jsonb,
  languages jsonb,
  legendary_actions jsonb,
  planes jsonb,
  reactions jsonb,
  senses jsonb,
  traits jsonb
);


--------------------------------------------------------------------------------
-- CREATURE RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_creature_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'creature'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a creature', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_creature_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_creature_resource_kind
  BEFORE INSERT OR UPDATE ON public.creatures
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_creature_resource_kind();

GRANT ALL ON FUNCTION public.validate_creature_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_creature_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_creature_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- CREATURES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creatures"
ON public.creatures
FOR SELECT TO authenticated
USING (public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can create new creatures"
ON public.creatures
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update creatures"
ON public.creatures
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete creatures"
ON public.creatures
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- CREATURE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read creature translations"
ON public.creature_translations
FOR SELECT TO authenticated
USING (public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can create new creature translations"
ON public.creature_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update creature translations"
ON public.creature_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete creature translations"
ON public.creature_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


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
    condition_immunities, condition_resistances, condition_vulnerabilities
  ) VALUES (
    v_id, r.type, r.alignment, r.size, r.habitats, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
    r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb, r.speed_burrow,
    r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
    r.initiative, r.passive_perception, r.ability_proficiencies, r.skill_proficiencies, r.skill_expertise,
    r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
    r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities
  );

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
RETURNS public.creature_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
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
    c.condition_immunities,
    c.condition_resistances,
    c.condition_vulnerabilities,
    c.cr,
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
RETURNS SETOF public.creature_row
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
    c.damage_immunities,
    c.damage_resistances,
    c.damage_vulnerabilities,
    c.condition_immunities,
    c.condition_resistances,
    c.condition_vulnerabilities
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
  f.condition_immunities,
  f.condition_resistances,
  f.condition_vulnerabilities,
  f.cr,
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
    resource_id, lang, gear, languages, planes, senses,
    traits, actions, bonus_actions, reactions, legendary_actions
  ) VALUES (
    p_id, p_lang, r.gear, r.languages, r.planes, r.senses,
    r.traits, r.actions, r.bonus_actions, r.reactions, r.legendary_actions
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
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
    condition_immunities, condition_resistances, condition_vulnerabilities
  ) = (
    SELECT r.type, r.alignment, r.size, r.habitats, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
      r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb, r.speed_burrow,
      r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
      r.initiative, r.passive_perception, r.ability_proficiencies, r.skill_proficiencies, r.skill_expertise,
      r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
      r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities
    FROM jsonb_populate_record(null::public.creatures, to_jsonb(c) || p_creature) as r
  )
  WHERE c.resource_id = p_id;

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
