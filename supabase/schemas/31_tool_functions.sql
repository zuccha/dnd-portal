--------------------------------------------------------------------------------
-- TOOL ROW
--------------------------------------------------------------------------------

CREATE TYPE public.tool_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  id uuid,
  kind public.resource_kind,
  visibility public.campaign_role,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Equipment
  cost integer,
  magic boolean,
  rarity public.equipment_rarity,
  weight integer,
  notes jsonb,
  -- Tool
  ability public.creature_ability,
  craft_ids uuid[],
  type public.tool_type,
  -- Tool Translation
  utilize jsonb
);


--------------------------------------------------------------------------------
-- CREATE TOOL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_tool(
  p_source_id uuid,
  p_lang text,
  p_tool jsonb,
  p_tool_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.tools%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.tools, p_tool);

  v_id := public.create_equipment(
    p_source_id,
    p_lang,
    p_tool || jsonb_build_object('kind', 'tool'::public.resource_kind),
    p_tool_translation
  );

  INSERT INTO public.tools (
    resource_id, type, ability
  ) VALUES (
    v_id, r.type, r.ability
  );

  INSERT INTO public.tool_crafts (tool_id, equipment_id)
  SELECT
    v_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_tool->'craft_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.tool_crafts tc
    WHERE tc.tool_id = v_id
      AND tc.equipment_id = (v.value)::uuid
  );

  perform public.upsert_tool_translation(v_id, p_lang, p_tool_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_tool(p_source_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_tool(p_source_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_tool(p_source_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_tool(p_source_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH TOOL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_tool(p_id uuid)
RETURNS public.tool_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.source_id,
    e.source_code,
    e.id,
    e.kind,
    e.visibility,
    e.image_url,
    e.name,
    e.name_short,
    e.page,
    e.cost,
    e.magic,
    e.rarity,
    e.weight,
    e.notes,
    t.ability,
    coalesce(tc.craft_ids, '{}'::uuid[]) AS craft_ids,
    t.type,
    coalesce(tt.utilize, '{}'::jsonb) AS utilize
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.tools t ON t.resource_id = e.id
  LEFT JOIN (
    SELECT
      tc.tool_id AS id,
      array_agg(tc.equipment_id ORDER BY tc.equipment_id) AS craft_ids
    FROM public.tool_crafts tc
    WHERE tc.tool_id = p_id
    GROUP BY tc.tool_id
  ) tc ON tc.id = e.id
  LEFT JOIN (
    SELECT
      t.resource_id AS id,
      jsonb_object_agg(tt.lang, tt.utilize) AS utilize
    FROM public.tools t
    LEFT JOIN public.tool_translations tt ON tt.resource_id = t.resource_id
    WHERE t.resource_id = p_id
    GROUP BY t.resource_id
  ) tt ON tt.id = e.id
  WHERE e.id = p_id;
$$;

ALTER FUNCTION public.fetch_tool(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_tool(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_tool(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_tool(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH TOOLS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_tools(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.tool_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.tool_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.tool_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc,

    -- abilities
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_ability), null)
      FROM jsonb_each_text(p_filters->'abilities') AS e(key, value)
      WHERE e.value = 'true'
    ) AS abilities_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_ability), null)
      FROM jsonb_each_text(p_filters->'abilities') AS e(key, value)
      WHERE e.value = 'false'
    ) AS abilities_exc
),
base AS (
  SELECT e.*
  FROM public.fetch_equipments(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS e
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
    b.cost,
    b.magic,
    b.rarity,
    b.weight,
    b.notes,
    t.ability,
    t.type
  FROM base b
  JOIN public.tools t ON t.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
    AND (p.abilities_inc IS NULL OR s.ability = any(p.abilities_inc))
    AND (p.abilities_exc IS NULL OR NOT (s.ability = any(p.abilities_exc)))
),
tt AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.utilize) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS utilize
  FROM filtered f
  LEFT JOIN public.tool_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
),
tc AS (
  SELECT
    tc.tool_id AS id,
    array_agg(tc.equipment_id ORDER BY tc.equipment_id) AS craft_ids
  FROM public.tool_crafts tc
  GROUP BY tc.tool_id
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
  f.cost,
  f.magic,
  f.rarity,
  f.weight,
  f.notes,
  f.ability,
  coalesce(tc.craft_ids, '{}'::uuid[]) AS craft_ids,
  f.type,
  coalesce(tt.utilize, '{}'::jsonb) AS utilize
FROM filtered f
LEFT JOIN tt ON tt.id = f.id
LEFT JOIN tc ON tc.id = f.id
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

ALTER FUNCTION public.fetch_tools(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_tools(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_tools(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_tools(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT TOOL TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_tool_translation(
  p_id uuid,
  p_lang text,
  p_tool_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.tool_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.tool_translations, p_tool_translation);

  INSERT INTO public.tool_translations AS tt (
    resource_id, lang, utilize
  ) VALUES (
    p_id, p_lang, r.utilize
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    utilize = excluded.utilize;

  perform public.upsert_resource_translation(p_id, p_lang, p_tool_translation);
  perform public.upsert_equipment_translation(p_id, p_lang, p_tool_translation);
END;
$$;

ALTER FUNCTION public.upsert_tool_translation(p_id uuid, p_lang text, p_tool_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_tool_translation(p_id uuid, p_lang text, p_tool_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_tool_translation(p_id uuid, p_lang text, p_tool_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_tool_translation(p_id uuid, p_lang text, p_tool_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE TOOL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_tool(
  p_id uuid,
  p_lang text,
  p_tool jsonb,
  p_tool_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows int;
BEGIN
  perform public.update_equipment(
    p_id,
    p_lang,
    p_tool || jsonb_build_object('kind', 'tool'::public.resource_kind),
    p_tool_translation
  );

  UPDATE public.tools t
  SET (
    type, ability
  ) = (
    SELECT r.type, r.ability
    FROM jsonb_populate_record(null::public.tools, to_jsonb(t) || p_tool) AS r
  )
  WHERE t.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  WITH entries AS (
    SELECT
      (value)::uuid AS equipment_id
    FROM jsonb_array_elements_text(
      coalesce(p_tool->'craft_ids', '[]'::jsonb)
    )
  )
  DELETE FROM public.tool_crafts tc
  WHERE tc.tool_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.equipment_id = tc.equipment_id
    );

  WITH entries AS (
    SELECT
      (value)::uuid AS equipment_id
    FROM jsonb_array_elements_text(
      coalesce(p_tool->'craft_ids', '[]'::jsonb)
    )
  )
  INSERT INTO public.tool_crafts (tool_id, equipment_id)
  SELECT
    p_id,
    e.equipment_id
  FROM (
    SELECT DISTINCT equipment_id FROM entries
  ) e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.tool_crafts tc
    WHERE tc.tool_id = p_id
      AND tc.equipment_id = e.equipment_id
  );

  perform public.upsert_tool_translation(p_id, p_lang, p_tool_translation);
END;
$$;

ALTER FUNCTION public.update_tool(p_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_tool(p_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_tool(p_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_tool(p_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO service_role;
