DO $$
BEGIN
  CREATE TYPE public.creature_language_mode AS ENUM (
    'speaks',
    'understands'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

ALTER TYPE public.creature_language_mode OWNER TO postgres;

ALTER TABLE public.creature_languages
ADD COLUMN mode public.creature_language_mode DEFAULT 'speaks'::public.creature_language_mode NOT NULL;

ALTER FUNCTION public.create_creature(uuid, text, jsonb, jsonb)
RENAME TO create_creature_without_language_mode;

ALTER FUNCTION public.update_creature(uuid, text, jsonb, jsonb)
RENAME TO update_creature_without_language_mode;

ALTER FUNCTION public.fetch_creature(uuid)
RENAME TO fetch_creature_without_language_mode;

ALTER FUNCTION public.fetch_creatures(uuid, text[], jsonb, text, text)
RENAME TO fetch_creatures_without_language_mode;

ALTER TYPE public.creature_row
DROP ATTRIBUTE language_ids CASCADE;

ALTER TYPE public.creature_row
ADD ATTRIBUTE language_entries jsonb CASCADE;

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
  v_id := public.create_creature_without_language_mode(
    p_source_id,
    p_lang,
    p_creature,
    p_creature_translation
  );

  IF p_creature ? 'language_entries' THEN
    DELETE FROM public.creature_languages
    WHERE creature_id = v_id;

    INSERT INTO public.creature_languages (creature_id, language_id, mode)
    SELECT
      v_id,
      e.language_id,
      e.mode
    FROM (
      SELECT DISTINCT ON (language_id) language_id, mode
      FROM (
        SELECT
          language_id,
          coalesce(mode, 'speaks'::public.creature_language_mode) AS mode
        FROM jsonb_to_recordset(
          coalesce(p_creature->'language_entries', '[]'::jsonb)
        ) AS e(
          language_id uuid,
          mode public.creature_language_mode
        )
      ) raw_entries
      ORDER BY language_id
    ) e;
  END IF;

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
    coalesce(cl.language_entries, '[]'::jsonb) AS language_entries
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

CREATE OR REPLACE FUNCTION public.fetch_creatures(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.creature_row
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
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
    coalesce((p_filters->>'cr_min')::numeric, 0) AS cr_min,
    coalesce((p_filters->>'cr_max')::numeric, 30) AS cr_max
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'creature'::public.resource_kind
),
filtered AS (
  SELECT b.id, b.name, c.type, c.habitats, c.treasures, c.alignment, c.size, c.cr
  FROM base b
  JOIN public.creatures c ON c.resource_id = b.id
  CROSS JOIN prefs p
  WHERE
        (p.types_inc IS NULL OR c.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (c.type = any(p.types_exc)))
    AND (p.habitats_inc IS NULL OR c.habitats && p.habitats_inc)
    AND (p.habitats_exc IS NULL OR NOT (c.habitats && p.habitats_exc))
    AND (p.treasures_inc IS NULL OR c.treasures && p.treasures_inc)
    AND (p.treasures_exc IS NULL OR NOT (c.treasures && p.treasures_exc))
    AND (p.alignment_inc IS NULL OR c.alignment = any(p.alignment_inc))
    AND (p.alignment_exc IS NULL OR NOT (c.alignment = any(p.alignment_exc)))
    AND (p.size_inc IS NULL OR c.size = any(p.size_inc))
    AND (p.size_exc IS NULL OR NOT (c.size = any(p.size_exc)))
    AND c.cr >= p.cr_min
    AND c.cr <= p.cr_max
)
SELECT fc.*
FROM filtered f
JOIN LATERAL public.fetch_creature(f.id) fc ON true
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
  PERFORM public.update_creature_without_language_mode(
    p_id,
    p_lang,
    p_creature,
    p_creature_translation
  );

  IF p_creature ? 'language_entries' THEN
    DELETE FROM public.creature_languages
    WHERE creature_id = p_id;

    INSERT INTO public.creature_languages (creature_id, language_id, mode)
    SELECT
      p_id,
      e.language_id,
      e.mode
    FROM (
      SELECT DISTINCT ON (language_id) language_id, mode
      FROM (
        SELECT
          language_id,
          coalesce(mode, 'speaks'::public.creature_language_mode) AS mode
        FROM jsonb_to_recordset(
          coalesce(p_creature->'language_entries', '[]'::jsonb)
        ) AS e(
          language_id uuid,
          mode public.creature_language_mode
        )
      ) raw_entries
      ORDER BY language_id
    ) e;
  END IF;
END;
$$;

ALTER FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb) TO service_role;
