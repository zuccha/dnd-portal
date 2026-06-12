ALTER TABLE public.creature_equipment ADD COLUMN IF NOT EXISTS notes jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.character_class_starting_equipment ADD COLUMN IF NOT EXISTS notes jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.background_starting_equipment ADD COLUMN IF NOT EXISTS notes jsonb NOT NULL DEFAULT '{}'::jsonb;

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
    r.initiative, coalesce(r.language_additional_count, 0), r.language_scope, r.passive_perception,
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
    notes,
    quantity
  )
  SELECT
    v_id,
    e.equipment_id,
    e.notes,
    e.quantity
  FROM (
    SELECT
      e.equipment_id AS equipment_id,
      coalesce(e.notes, '{}'::jsonb) AS notes,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_creature->'equipment_entries', '[]'::jsonb)
    ) AS e(
      equipment_id uuid,
      notes jsonb,
      quantity smallint
    )
    GROUP BY e.equipment_id, coalesce(e.notes, '{}'::jsonb)
  ) e;

  perform public.upsert_creature_translation(v_id, p_lang, p_creature_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO service_role;

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
    r.source_version,
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
          'notes', ce.notes,
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
    b.source_version,
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
        'notes', ce.notes,
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
  f.source_version,
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
      coalesce(e.notes, '{}'::jsonb) AS notes,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_creature->'equipment_entries', '[]'::jsonb)
    ) AS e(
      equipment_id uuid,
      notes jsonb,
      quantity smallint
    )
    GROUP BY e.equipment_id, coalesce(e.notes, '{}'::jsonb)
  )
  DELETE FROM public.creature_equipment ce
  WHERE ce.creature_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.equipment_id IS NOT DISTINCT FROM ce.equipment_id
        AND e.notes = ce.notes
        AND e.quantity = ce.quantity
    );

  WITH entries AS (
    SELECT
      e.equipment_id AS equipment_id,
      coalesce(e.notes, '{}'::jsonb) AS notes,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_creature->'equipment_entries', '[]'::jsonb)
    ) AS e(
      equipment_id uuid,
      notes jsonb,
      quantity smallint
    )
    GROUP BY e.equipment_id, coalesce(e.notes, '{}'::jsonb)
  )
  INSERT INTO public.creature_equipment (
    creature_id,
    equipment_id,
    notes,
    quantity
  )
  SELECT
    p_id,
    e.equipment_id,
    e.notes,
    e.quantity
  FROM entries e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.creature_equipment ce
    WHERE ce.creature_id = p_id
      AND ce.equipment_id IS NOT DISTINCT FROM e.equipment_id
      AND ce.notes = e.notes
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

-- CREATE CHARACTER CLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_character_class(
  p_source_id uuid,
  p_lang text,
  p_character_class jsonb,
  p_character_class_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.character_classes%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_classes, p_character_class);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_character_class || jsonb_build_object('kind', 'character_class'::public.resource_kind),
    p_character_class_translation
  );

  INSERT INTO public.character_classes (
    resource_id,
    primary_abilities,
    hp_die,
    saving_throw_proficiencies,
    skill_proficiencies_pool,
    skill_proficiencies_pool_quantity,
    weapon_proficiencies,
    armor_proficiencies
  ) VALUES (
    v_id,
    r.primary_abilities,
    r.hp_die,
    r.saving_throw_proficiencies,
    r.skill_proficiencies_pool,
    r.skill_proficiencies_pool_quantity,
    r.weapon_proficiencies,
    r.armor_proficiencies
  );

  INSERT INTO public.character_class_starting_equipment (
    character_class_id,
    choice_group,
    choice_option,
    equipment_id,
    notes,
    quantity
  )
  SELECT
    v_id,
    e.choice_group,
    e.choice_option,
    e.equipment_id,
    e.notes,
    e.quantity
  FROM (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      coalesce(e.notes, '{}'::jsonb) AS notes,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_character_class->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      notes jsonb,
      quantity smallint
    )
    GROUP BY
      coalesce(e.choice_group, 1),
      e.choice_option,
      e.equipment_id,
      coalesce(e.notes, '{}'::jsonb)
  ) e;

  INSERT INTO public.character_class_tool_proficiencies (character_class_id, tool_id)
  SELECT
    v_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_character_class->'tool_proficiency_ids', '[]'::jsonb)
  );

  INSERT INTO public.character_class_spells (character_class_id, spell_id)
  SELECT
    v_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_character_class->'spell_ids', '[]'::jsonb)
  );

  perform public.replace_resource_feature_entries(
    v_id,
    coalesce(p_character_class->'feature_entries', '[]'::jsonb)
  );

  perform public.upsert_character_class_translation(
    v_id,
    p_lang,
    p_character_class_translation
  );

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_character_class(p_source_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_character_class(p_source_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_character_class(p_source_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_character_class(p_source_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO service_role;

-- FETCH CHARACTER CLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_character_class(p_id uuid)
RETURNS public.character_class_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.source_id,
    r.source_code,
    r.source_version,
    r.id,
    r.kind,
    r.visibility,
    r.image_url,
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
    public.fetch_resource_feature_entries(r.id) AS feature_entries,
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
          'notes', se.notes,
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
$$;

ALTER FUNCTION public.fetch_character_class(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_character_class(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_character_class(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_character_class(p_id uuid) TO service_role;

-- FETCH CHARACTER CLASSES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_character_classes(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.character_class_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'character_class'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.source_id,
    b.source_code,
    b.source_version,
    b.kind,
    b.visibility,
    b.image_url,
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
        'notes', se.notes,
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
  s.source_id,
  s.source_code,
  s.source_version,
  s.id,
  s.kind,
  s.visibility,
  s.image_url,
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
  public.fetch_resource_feature_entries(s.id) AS feature_entries,
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
$$;

ALTER FUNCTION public.fetch_character_classes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_character_classes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_character_classes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_character_classes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

-- UPDATE CHARACTER CLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_character_class(
  p_id uuid,
  p_lang text,
  p_character_class jsonb,
  p_character_class_translation jsonb)
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
    p_character_class || jsonb_build_object('kind', 'character_class'::public.resource_kind),
    p_character_class_translation
  );

  UPDATE public.character_classes c
  SET (
    primary_abilities,
    hp_die,
    saving_throw_proficiencies,
    skill_proficiencies_pool,
    skill_proficiencies_pool_quantity,
    weapon_proficiencies,
    armor_proficiencies
  ) = (
    SELECT
      r.primary_abilities,
      r.hp_die,
      r.saving_throw_proficiencies,
      r.skill_proficiencies_pool,
      r.skill_proficiencies_pool_quantity,
      r.weapon_proficiencies,
      r.armor_proficiencies
    FROM jsonb_populate_record(null::public.character_classes, to_jsonb(c) || p_character_class) AS r
  )
  WHERE c.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  WITH entries AS (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      coalesce(e.notes, '{}'::jsonb) AS notes,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_character_class->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      notes jsonb,
      quantity smallint
    )
    GROUP BY
      coalesce(e.choice_group, 1),
      e.choice_option,
      e.equipment_id,
      coalesce(e.notes, '{}'::jsonb)
  )
  DELETE FROM public.character_class_starting_equipment se
  WHERE se.character_class_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.choice_group = se.choice_group
        AND e.choice_option = se.choice_option
        AND e.equipment_id IS NOT DISTINCT FROM se.equipment_id
        AND e.notes = se.notes
        AND e.quantity = se.quantity
    );

  DELETE FROM public.character_class_spells cs
  WHERE cs.character_class_id = p_id
    AND NOT (cs.spell_id = any(
      coalesce(
        (SELECT array_agg((value)::uuid)
         FROM jsonb_array_elements_text(
           coalesce(p_character_class->'spell_ids', '[]'::jsonb)
         )),
        '{}'::uuid[]
      )
    ));

  WITH entries AS (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      coalesce(e.notes, '{}'::jsonb) AS notes,
      coalesce(e.quantity, 1) AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_character_class->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      notes jsonb,
      quantity smallint
    )
  )
  INSERT INTO public.character_class_starting_equipment (
    character_class_id,
    choice_group,
    choice_option,
    equipment_id,
    notes,
    quantity
  )
  SELECT
    p_id,
    e.choice_group,
    e.choice_option,
    e.equipment_id,
    e.notes,
    e.quantity
  FROM entries e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.character_class_starting_equipment se
    WHERE se.character_class_id = p_id
      AND se.choice_group = e.choice_group
      AND se.choice_option = e.choice_option
      AND se.equipment_id IS NOT DISTINCT FROM e.equipment_id
      AND se.notes = e.notes
      AND se.quantity = e.quantity
  );

  DELETE FROM public.character_class_tool_proficiencies ct
  WHERE ct.character_class_id = p_id
    AND NOT (ct.tool_id = any(
      coalesce(
        (SELECT array_agg((value)::uuid)
         FROM jsonb_array_elements_text(
           coalesce(p_character_class->'tool_proficiency_ids', '[]'::jsonb)
         )),
        '{}'::uuid[]
      )
    ));

  INSERT INTO public.character_class_spells (character_class_id, spell_id)
  SELECT
    p_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_character_class->'spell_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.character_class_spells cs
    WHERE cs.character_class_id = p_id
      AND cs.spell_id = (v.value)::uuid
  );

  INSERT INTO public.character_class_tool_proficiencies (character_class_id, tool_id)
  SELECT
    p_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_character_class->'tool_proficiency_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.character_class_tool_proficiencies ct
    WHERE ct.character_class_id = p_id
      AND ct.tool_id = (v.value)::uuid
  );

  IF p_character_class ? 'feature_entries' THEN
    perform public.replace_resource_feature_entries(
      p_id,
      p_character_class->'feature_entries'
    );
  END IF;

  perform public.upsert_character_class_translation(p_id, p_lang, p_character_class_translation);
END;
$$;

ALTER FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO service_role;

-- CREATE BACKGROUND
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_background(
  p_source_id uuid,
  p_lang text,
  p_background jsonb,
  p_background_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.backgrounds%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.backgrounds, p_background);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_background || jsonb_build_object('kind', 'background'::public.resource_kind),
    p_background_translation
  );

  INSERT INTO public.backgrounds (
    resource_id,
    ability_scores,
    feat_id,
    skill_proficiencies,
    tool_proficiency_id
  ) VALUES (
    v_id,
    r.ability_scores,
    r.feat_id,
    r.skill_proficiencies,
    r.tool_proficiency_id
  );

  INSERT INTO public.background_starting_equipment (
    background_id,
    choice_group,
    choice_option,
    equipment_id,
    notes,
    quantity
  )
  SELECT
    v_id,
    e.choice_group,
    e.choice_option,
    e.equipment_id,
    e.notes,
    e.quantity
  FROM (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      coalesce(e.notes, '{}'::jsonb) AS notes,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_background->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      notes jsonb,
      quantity smallint
    )
    GROUP BY
      coalesce(e.choice_group, 1),
      e.choice_option,
      e.equipment_id,
      coalesce(e.notes, '{}'::jsonb)
  ) e;

  perform public.upsert_background_translation(
    v_id,
    p_lang,
    p_background_translation
  );

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_background(p_source_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_background(p_source_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_background(p_source_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_background(p_source_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO service_role;

-- FETCH BACKGROUND
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_background(p_id uuid)
RETURNS public.background_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.source_id,
    r.source_code,
    r.source_version,
    r.id,
    r.kind,
    r.visibility,
    r.image_url,
    r.name,
    r.name_short,
    r.page,
    b.ability_scores,
    b.feat_id,
    b.skill_proficiencies,
    coalesce(se.starting_equipment_entries, '[]'::jsonb) AS starting_equipment_entries,
    b.tool_proficiency_id,
    coalesce(tt.feat_notes, '{}'::jsonb) AS feat_notes,
    coalesce(tt.tool_notes, '{}'::jsonb) AS tool_notes
  FROM public.fetch_resource(p_id) AS r
  JOIN public.backgrounds b ON b.resource_id = r.id
  LEFT JOIN (
    SELECT
      se.background_id AS id,
      jsonb_agg(
        jsonb_build_object(
          'choice_group', se.choice_group,
          'choice_option', se.choice_option,
          'equipment_id', se.equipment_id,
          'notes', se.notes,
          'quantity', se.quantity
        )
        ORDER BY se.choice_group, se.choice_option, se.id
      ) AS starting_equipment_entries
    FROM public.background_starting_equipment se
    WHERE se.background_id = p_id
    GROUP BY se.background_id
  ) se ON se.id = r.id
  LEFT JOIN (
    SELECT
      b.resource_id AS id,
      jsonb_object_agg(t.lang, t.feat_notes) AS feat_notes,
      jsonb_object_agg(t.lang, t.tool_notes) AS tool_notes
    FROM public.backgrounds b
    LEFT JOIN public.background_translations t ON t.resource_id = b.resource_id
    WHERE b.resource_id = p_id
    GROUP BY b.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_background(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_background(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_background(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_background(p_id uuid) TO service_role;

-- FETCH BACKGROUNDS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_backgrounds(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.background_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'background'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.source_id,
    b.source_code,
    b.source_version,
    b.kind,
    b.visibility,
    b.image_url,
    b.name,
    b.name_short,
    b.page,
    bg.ability_scores,
    bg.feat_id,
    bg.skill_proficiencies,
    bg.tool_proficiency_id
  FROM base b
  JOIN public.backgrounds bg ON bg.resource_id = b.id
),
tse AS (
  SELECT
    se.background_id AS id,
    jsonb_agg(
      jsonb_build_object(
        'choice_group', se.choice_group,
        'choice_option', se.choice_option,
        'equipment_id', se.equipment_id,
        'notes', se.notes,
        'quantity', se.quantity
      )
      ORDER BY se.choice_group, se.choice_option, se.id
    ) AS starting_equipment_entries
  FROM public.background_starting_equipment se
  GROUP BY se.background_id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.feat_notes) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS feat_notes,
    jsonb_object_agg(t.lang, t.tool_notes) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS tool_notes
  FROM src s
  LEFT JOIN public.background_translations t ON t.resource_id = s.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY s.id
)
SELECT
  s.source_id,
  s.source_code,
  s.source_version,
  s.id,
  s.kind,
  s.visibility,
  s.image_url,
  s.name,
  s.name_short,
  s.page,
  s.ability_scores,
  s.feat_id,
  s.skill_proficiencies,
  coalesce(tse.starting_equipment_entries, '[]'::jsonb) AS starting_equipment_entries,
  s.tool_proficiency_id,
  coalesce(tt.feat_notes, '{}'::jsonb) AS feat_notes,
  coalesce(tt.tool_notes, '{}'::jsonb) AS tool_notes
FROM src s
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
$$;

ALTER FUNCTION public.fetch_backgrounds(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_backgrounds(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_backgrounds(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_backgrounds(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

-- UPDATE BACKGROUND
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_background(
  p_id uuid,
  p_lang text,
  p_background jsonb,
  p_background_translation jsonb)
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
    p_background || jsonb_build_object('kind', 'background'::public.resource_kind),
    p_background_translation
  );

  UPDATE public.backgrounds b
  SET (
    ability_scores,
    feat_id,
    skill_proficiencies,
    tool_proficiency_id
  ) = (
    SELECT
      r.ability_scores,
      r.feat_id,
      r.skill_proficiencies,
      r.tool_proficiency_id
    FROM jsonb_populate_record(null::public.backgrounds, to_jsonb(b) || p_background) AS r
  )
  WHERE b.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  WITH entries AS (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      coalesce(e.notes, '{}'::jsonb) AS notes,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_background->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      notes jsonb,
      quantity smallint
    )
    GROUP BY
      coalesce(e.choice_group, 1),
      e.choice_option,
      e.equipment_id,
      coalesce(e.notes, '{}'::jsonb)
  )
  DELETE FROM public.background_starting_equipment se
  WHERE se.background_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.choice_group = se.choice_group
        AND e.choice_option = se.choice_option
        AND e.equipment_id IS NOT DISTINCT FROM se.equipment_id
        AND e.notes = se.notes
        AND e.quantity = se.quantity
    );

  WITH entries AS (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      coalesce(e.notes, '{}'::jsonb) AS notes,
      coalesce(e.quantity, 1) AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_background->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      notes jsonb,
      quantity smallint
    )
  )
  INSERT INTO public.background_starting_equipment (
    background_id,
    choice_group,
    choice_option,
    equipment_id,
    notes,
    quantity
  )
  SELECT
    p_id,
    e.choice_group,
    e.choice_option,
    e.equipment_id,
    e.notes,
    e.quantity
  FROM entries e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.background_starting_equipment se
    WHERE se.background_id = p_id
      AND se.choice_group = e.choice_group
      AND se.choice_option = e.choice_option
      AND se.equipment_id IS NOT DISTINCT FROM e.equipment_id
      AND se.notes = e.notes
      AND se.quantity = e.quantity
  );

  perform public.upsert_background_translation(p_id, p_lang, p_background_translation);
END;
$$;

ALTER FUNCTION public.update_background(p_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_background(p_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_background(p_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_background(p_id uuid, p_lang text, p_background jsonb, p_background_translation jsonb) TO service_role;
