--------------------------------------------------------------------------------
-- CREATURE ROW
--------------------------------------------------------------------------------

CREATE TYPE public.creature_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
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
  blindsight integer,
  condition_immunities public.creature_condition[],
  condition_resistances public.creature_condition[],
  condition_vulnerabilities public.creature_condition[],
  cr numeric,
  darkvision integer,
  damage_immunities public.damage_type[],
  damage_resistances public.damage_type[],
  damage_vulnerabilities public.damage_type[],
  habitats public.creature_habitat[],
  hp smallint,
  hp_formula text,
  initiative smallint,
  language_additional_count smallint,
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
  equipment_entries jsonb,
  language_ids uuid[],
  language_scope public.language_scope,
  tag_ids uuid[],
  plane_ids uuid[],
  telepathy_range integer,
  tremorsense integer,
  truesight integer,
  type public.creature_type,
  -- Creature Translation
  actions jsonb,
  bonus_actions jsonb,
  gear jsonb,
  legendary_actions jsonb,
  reactions jsonb,
  traits jsonb
);


--------------------------------------------------------------------------------
-- CREATE CREATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_creature(
  p_source_id uuid,
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
    p_source_id,
    p_lang,
    p_creature || jsonb_build_object('kind', 'creature'::public.resource_kind),
    p_creature_translation
  );

  INSERT INTO public.creatures (
    resource_id, type, alignment, size, habitats, treasures, cr, ac, hp, hp_formula,
    speed_walk, speed_fly, speed_swim, speed_climb, speed_burrow,
    ability_str, ability_dex, ability_con, ability_int, ability_wis, ability_cha,
    initiative, language_additional_count, language_scope, passive_perception,
    ability_proficiencies, skill_proficiencies, skill_expertise,
    damage_immunities, damage_resistances, damage_vulnerabilities,
    condition_immunities, condition_resistances, condition_vulnerabilities,
    blindsight, darkvision, telepathy_range, tremorsense, truesight
  ) VALUES (
    v_id, r.type, r.alignment, r.size, r.habitats, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
    r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb, r.speed_burrow,
    r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
    r.initiative, r.language_additional_count, r.language_scope, r.passive_perception,
    r.ability_proficiencies, r.skill_proficiencies, r.skill_expertise,
    r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
    r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities,
    r.blindsight, r.darkvision, r.telepathy_range, r.tremorsense, r.truesight
  );

  INSERT INTO public.creature_languages (creature_id, language_id)
  SELECT
    v_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_creature->'language_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.creature_languages cl
    WHERE cl.creature_id = v_id
      AND cl.language_id = (v.value)::uuid
  );

  INSERT INTO public.creature_planes (creature_id, plane_id)
  SELECT
    v_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_creature->'plane_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.creature_planes cp
    WHERE cp.creature_id = v_id
      AND cp.plane_id = (v.value)::uuid
  );

  INSERT INTO public.creature_creature_tags (creature_id, creature_tag_id)
  SELECT
    v_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_creature->'tag_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.creature_creature_tags cct
    WHERE cct.creature_id = v_id
      AND cct.creature_tag_id = (v.value)::uuid
  );

  INSERT INTO public.creature_equipment (
    creature_id,
    equipment_id,
    quantity
  )
  SELECT
    v_id,
    e.equipment_id,
    e.quantity
  FROM (
    SELECT
      e.equipment_id AS equipment_id,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_creature->'equipment_entries', '[]'::jsonb)
    ) AS e(
      equipment_id uuid,
      quantity smallint
    )
    GROUP BY e.equipment_id
  ) e;

  perform public.upsert_creature_translation(v_id, p_lang, p_creature_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CREATURE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_creature(p_id uuid)
RETURNS public.creature_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.source_id,
    r.source_code,
    r.id,
    r.kind,
    r.visibility,
    r.image_url,
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
$$;

ALTER FUNCTION public.fetch_creature(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_creature(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_creature(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_creature(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CREATURES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_creatures(
  p_source_id uuid,
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
$$;

ALTER FUNCTION public.fetch_creatures(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_creatures(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_creatures(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_creatures(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


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
    resource_id, lang, gear,
    traits, actions, bonus_actions, reactions, legendary_actions
  ) VALUES (
    p_id, p_lang, r.gear,
    r.traits, r.actions, r.bonus_actions, r.reactions, r.legendary_actions
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    gear = excluded.gear,
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
    initiative, language_additional_count, language_scope, passive_perception,
    ability_proficiencies, skill_proficiencies, skill_expertise,
    damage_immunities, damage_resistances, damage_vulnerabilities,
    condition_immunities, condition_resistances, condition_vulnerabilities,
    blindsight, darkvision, telepathy_range, tremorsense, truesight
  ) = (
    SELECT r.type, r.alignment, r.size, r.habitats, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
      r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb, r.speed_burrow,
      r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
      r.initiative, r.language_additional_count, r.language_scope, r.passive_perception,
      r.ability_proficiencies, r.skill_proficiencies, r.skill_expertise,
      r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
      r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities,
      r.blindsight, r.darkvision, r.telepathy_range, r.tremorsense, r.truesight
    FROM jsonb_populate_record(null::public.creatures, to_jsonb(c) || p_creature) as r
  )
  WHERE c.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  WITH entries AS (
    SELECT
      e.equipment_id AS equipment_id,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_creature->'equipment_entries', '[]'::jsonb)
    ) AS e(
      equipment_id uuid,
      quantity smallint
    )
    GROUP BY e.equipment_id
  )
  DELETE FROM public.creature_equipment ce
  WHERE ce.creature_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.equipment_id IS NOT DISTINCT FROM ce.equipment_id
        AND e.quantity = ce.quantity
    );

  WITH entries AS (
    SELECT
      e.equipment_id AS equipment_id,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_creature->'equipment_entries', '[]'::jsonb)
    ) AS e(
      equipment_id uuid,
      quantity smallint
    )
    GROUP BY e.equipment_id
  )
  INSERT INTO public.creature_equipment (
    creature_id,
    equipment_id,
    quantity
  )
  SELECT
    p_id,
    e.equipment_id,
    e.quantity
  FROM entries e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.creature_equipment ce
    WHERE ce.creature_id = p_id
      AND ce.equipment_id IS NOT DISTINCT FROM e.equipment_id
      AND ce.quantity = e.quantity
  );

  WITH entries AS (
    SELECT
      (value)::uuid AS language_id
    FROM jsonb_array_elements_text(
      coalesce(p_creature->'language_ids', '[]'::jsonb)
    )
  )
  DELETE FROM public.creature_languages cl
  WHERE cl.creature_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.language_id = cl.language_id
    );

  WITH entries AS (
    SELECT
      (value)::uuid AS language_id
    FROM jsonb_array_elements_text(
      coalesce(p_creature->'language_ids', '[]'::jsonb)
    )
  )
  INSERT INTO public.creature_languages (creature_id, language_id)
  SELECT
    p_id,
    e.language_id
  FROM (
    SELECT DISTINCT language_id FROM entries
  ) e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.creature_languages cl
    WHERE cl.creature_id = p_id
      AND cl.language_id = e.language_id
  );

  WITH entries AS (
    SELECT
      (value)::uuid AS plane_id
    FROM jsonb_array_elements_text(
      coalesce(p_creature->'plane_ids', '[]'::jsonb)
    )
  )
  DELETE FROM public.creature_planes cp
  WHERE cp.creature_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.plane_id = cp.plane_id
    );

  WITH entries AS (
    SELECT
      (value)::uuid AS plane_id
    FROM jsonb_array_elements_text(
      coalesce(p_creature->'plane_ids', '[]'::jsonb)
    )
  )
  INSERT INTO public.creature_planes (creature_id, plane_id)
  SELECT
    p_id,
    e.plane_id
  FROM (
    SELECT DISTINCT plane_id FROM entries
  ) e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.creature_planes cp
    WHERE cp.creature_id = p_id
      AND cp.plane_id = e.plane_id
  );

  WITH entries AS (
    SELECT
      (value)::uuid AS creature_tag_id
    FROM jsonb_array_elements_text(
      coalesce(p_creature->'tag_ids', '[]'::jsonb)
    )
  )
  DELETE FROM public.creature_creature_tags cct
  WHERE cct.creature_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.creature_tag_id = cct.creature_tag_id
    );

  WITH entries AS (
    SELECT
      (value)::uuid AS creature_tag_id
    FROM jsonb_array_elements_text(
      coalesce(p_creature->'tag_ids', '[]'::jsonb)
    )
  )
  INSERT INTO public.creature_creature_tags (creature_id, creature_tag_id)
  SELECT
    p_id,
    e.creature_tag_id
  FROM (
    SELECT DISTINCT creature_tag_id FROM entries
  ) e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.creature_creature_tags cct
    WHERE cct.creature_id = p_id
      AND cct.creature_tag_id = e.creature_tag_id
  );

  perform public.upsert_creature_translation(p_id, p_lang, p_creature_translation);
END;
$$;

ALTER FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO service_role;
