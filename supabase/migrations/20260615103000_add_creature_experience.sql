ALTER TABLE public.creatures
ADD COLUMN exp integer DEFAULT 0 NOT NULL,
ADD COLUMN lair_exp integer DEFAULT 0 NOT NULL,
ADD COLUMN pb smallint DEFAULT 2 NOT NULL;

UPDATE public.creatures
SET
  exp = CASE cr
    WHEN 0 THEN 0
    WHEN 0.125 THEN 25
    WHEN 0.25 THEN 50
    WHEN 0.5 THEN 100
    WHEN 1 THEN 200
    WHEN 2 THEN 450
    WHEN 3 THEN 700
    WHEN 4 THEN 1100
    WHEN 5 THEN 1800
    WHEN 6 THEN 2300
    WHEN 7 THEN 2900
    WHEN 8 THEN 3900
    WHEN 9 THEN 5000
    WHEN 10 THEN 5900
    WHEN 11 THEN 7200
    WHEN 12 THEN 8400
    WHEN 13 THEN 10000
    WHEN 14 THEN 11500
    WHEN 15 THEN 13000
    WHEN 16 THEN 15000
    WHEN 17 THEN 18000
    WHEN 18 THEN 20000
    WHEN 19 THEN 22000
    WHEN 20 THEN 25000
    WHEN 21 THEN 33000
    WHEN 22 THEN 41000
    WHEN 23 THEN 50000
    WHEN 24 THEN 62000
    WHEN 25 THEN 75000
    WHEN 26 THEN 90000
    WHEN 27 THEN 105000
    WHEN 28 THEN 120000
    WHEN 29 THEN 135000
    WHEN 30 THEN 155000
    ELSE 0
  END,
  lair_exp = CASE cr
    WHEN 0 THEN 25
    WHEN 0.125 THEN 50
    WHEN 0.25 THEN 100
    WHEN 0.5 THEN 200
    WHEN 1 THEN 450
    WHEN 2 THEN 700
    WHEN 3 THEN 1100
    WHEN 4 THEN 1800
    WHEN 5 THEN 2300
    WHEN 6 THEN 2900
    WHEN 7 THEN 3900
    WHEN 8 THEN 5000
    WHEN 9 THEN 5900
    WHEN 10 THEN 7200
    WHEN 11 THEN 8400
    WHEN 12 THEN 8400
    WHEN 13 THEN 11500
    WHEN 14 THEN 13000
    WHEN 15 THEN 15000
    WHEN 16 THEN 18000
    WHEN 17 THEN 20000
    WHEN 18 THEN 22000
    WHEN 19 THEN 25000
    WHEN 20 THEN 33000
    WHEN 21 THEN 41000
    WHEN 22 THEN 50000
    WHEN 23 THEN 62000
    WHEN 24 THEN 75000
    WHEN 25 THEN 90000
    WHEN 26 THEN 105000
    WHEN 27 THEN 120000
    WHEN 28 THEN 135000
    WHEN 29 THEN 155000
    WHEN 30 THEN 180000
    ELSE 0
  END,
  pb = CASE
    WHEN cr <= 4 THEN 2
    WHEN cr <= 8 THEN 3
    WHEN cr <= 12 THEN 4
    WHEN cr <= 16 THEN 5
    WHEN cr <= 20 THEN 6
    WHEN cr <= 24 THEN 7
    WHEN cr <= 28 THEN 8
    ELSE 9
  END;

ALTER TYPE public.creature_row
ADD ATTRIBUTE exp integer CASCADE;

ALTER TYPE public.creature_row
ADD ATTRIBUTE lair_exp integer CASCADE;

ALTER TYPE public.creature_row
ADD ATTRIBUTE pb smallint CASCADE;

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
BEGIN
  v_id := public.create_creature_without_lair(
    p_source_id,
    p_lang,
    p_creature,
    p_creature_translation
  );

  UPDATE public.creatures c
  SET
    exp = coalesce((p_creature->>'exp')::integer, c.exp),
    has_lair = coalesce((p_creature->>'has_lair')::boolean, false),
    lair_exp = coalesce((p_creature->>'lair_exp')::integer, c.lair_exp),
    lair_legendary_actions_count = coalesce(
      (p_creature->>'lair_legendary_actions_count')::smallint,
      0
    ),
    legendary_actions_count = coalesce(
      (p_creature->>'legendary_actions_count')::smallint,
      0
    ),
    pb = coalesce((p_creature->>'pb')::smallint, c.pb)
  WHERE c.resource_id = v_id;

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_creature(p_source_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO service_role;

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
    coalesce(tt.traits, '{}'::jsonb) AS traits,
    c.hover,
    coalesce(cl.language_entries, '[]'::jsonb) AS language_entries,
    c.has_lair,
    coalesce(tt.lair_effects, '{}'::jsonb) AS lair_effects,
    c.lair_legendary_actions_count,
    c.legendary_actions_count,
    c.exp,
    c.lair_exp,
    c.pb
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
      jsonb_object_agg(t.lang, t.legendary_actions) AS legendary_actions,
      jsonb_object_agg(t.lang, t.lair_effects)      AS lair_effects
    FROM public.creatures c
    LEFT JOIN public.creature_translations t ON t.resource_id = c.resource_id
    WHERE c.resource_id = p_id
    GROUP BY c.resource_id
  ) tt ON tt.id = r.id
  LEFT JOIN (
    SELECT
      cl.creature_id AS id,
      jsonb_agg(
        jsonb_build_object(
          'language_id', cl.language_id,
          'mode', cl.mode
        )
        ORDER BY cl.language_id
      ) AS language_entries
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

CREATE OR REPLACE FUNCTION public.update_creature(
  p_id uuid,
  p_lang text,
  p_creature jsonb,
  p_creature_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  PERFORM public.update_creature_without_lair(
    p_id,
    p_lang,
    p_creature,
    p_creature_translation
  );

  UPDATE public.creatures c
  SET
    exp = coalesce((p_creature->>'exp')::integer, c.exp),
    has_lair = coalesce((p_creature->>'has_lair')::boolean, c.has_lair),
    lair_exp = coalesce((p_creature->>'lair_exp')::integer, c.lair_exp),
    lair_legendary_actions_count = coalesce(
      (p_creature->>'lair_legendary_actions_count')::smallint,
      c.lair_legendary_actions_count
    ),
    legendary_actions_count = coalesce(
      (p_creature->>'legendary_actions_count')::smallint,
      c.legendary_actions_count
    ),
    pb = coalesce((p_creature->>'pb')::smallint, c.pb)
  WHERE c.resource_id = p_id;
END;
$$;

ALTER FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO service_role;
