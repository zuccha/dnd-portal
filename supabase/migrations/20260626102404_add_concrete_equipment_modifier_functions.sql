--------------------------------------------------------------------------------
-- EQUIPMENT MODIFIER BASE FUNCTIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_equipment_modifier_base(
  p_source_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.equipment_modifiers%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipment_modifiers, p_equipment_modifier);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_equipment_modifier || jsonb_build_object('kind', 'equipment_modifier'::public.resource_kind),
    p_equipment_modifier_translation
  );

  INSERT INTO public.modifiers (resource_id)
  VALUES (v_id);

  INSERT INTO public.equipment_modifiers (
    resource_id, cost_delta, make_magic, rarity_minimum,
    required_attunement_slots_minimum, weight_delta
  ) VALUES (
    v_id, coalesce(r.cost_delta, 0), coalesce(r.make_magic, false), r.rarity_minimum,
    coalesce(r.required_attunement_slots_minimum, 0), coalesce(r.weight_delta, 0)
  );

  perform public.upsert_equipment_modifier_translation(
    v_id,
    p_lang,
    p_equipment_modifier_translation
  );

  RETURN v_id;
END;
$$;

GRANT ALL ON FUNCTION public.create_equipment_modifier_base(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_equipment_modifier_base(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_equipment_modifier_base(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_equipment_modifier_base(p_id uuid)
RETURNS public.equipment_modifier_row
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
    em.cost_delta,
    em.make_magic,
    em.rarity_minimum,
    em.required_attunement_slots_minimum,
    em.weight_delta,
    coalesce(tt.applies_to, '{}'::jsonb) AS applies_to,
    coalesce(tt.attunement_notes_delta, '{}'::jsonb) AS attunement_notes_delta,
    coalesce(tt.composite_name, '{}'::jsonb) AS composite_name,
    coalesce(tt.notes_delta, '{}'::jsonb) AS notes_delta,
    '[]'::jsonb AS equipment_ids
  FROM public.fetch_resource(p_id) AS r
  JOIN public.equipment_modifiers em ON em.resource_id = r.id
  LEFT JOIN (
    SELECT
      em.resource_id AS id,
      jsonb_object_agg(mt.lang, mt.applies_to) AS applies_to,
      jsonb_object_agg(mt.lang, mt.composite_name) AS composite_name,
      jsonb_object_agg(emt.lang, emt.attunement_notes_delta) AS attunement_notes_delta,
      jsonb_object_agg(emt.lang, emt.notes_delta) AS notes_delta
    FROM public.equipment_modifiers em
    LEFT JOIN public.modifier_translations mt ON mt.resource_id = em.resource_id
    LEFT JOIN public.equipment_modifier_translations emt
      ON emt.resource_id = em.resource_id
      AND emt.lang = mt.lang
    WHERE em.resource_id = p_id
    GROUP BY em.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

GRANT ALL ON FUNCTION public.fetch_equipment_modifier_base(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipment_modifier_base(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipment_modifier_base(p_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_equipment_modifiers_base(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'equipment_modifier'::public.resource_kind
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
    em.cost_delta,
    em.make_magic,
    em.rarity_minimum,
    em.required_attunement_slots_minimum,
    em.weight_delta
  FROM base b
  JOIN public.equipment_modifiers em ON em.resource_id = b.id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(mt.lang, mt.applies_to) FILTER (WHERE array_length(p_langs,1) IS NULL OR mt.lang = any(p_langs)) AS applies_to,
    jsonb_object_agg(mt.lang, mt.composite_name) FILTER (WHERE array_length(p_langs,1) IS NULL OR mt.lang = any(p_langs)) AS composite_name,
    jsonb_object_agg(emt.lang, emt.attunement_notes_delta) FILTER (WHERE array_length(p_langs,1) IS NULL OR emt.lang = any(p_langs)) AS attunement_notes_delta,
    jsonb_object_agg(emt.lang, emt.notes_delta) FILTER (WHERE array_length(p_langs,1) IS NULL OR emt.lang = any(p_langs)) AS notes_delta
  FROM src s
  LEFT JOIN public.modifier_translations mt ON mt.resource_id = s.id
  LEFT JOIN public.equipment_modifier_translations emt
    ON emt.resource_id = s.id
    AND emt.lang = mt.lang
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
  s.cost_delta,
  s.make_magic,
  s.rarity_minimum,
  s.required_attunement_slots_minimum,
  s.weight_delta,
  coalesce(t.applies_to, '{}'::jsonb) AS applies_to,
  coalesce(t.attunement_notes_delta, '{}'::jsonb) AS attunement_notes_delta,
  coalesce(t.composite_name, '{}'::jsonb) AS composite_name,
  coalesce(t.notes_delta, '{}'::jsonb) AS notes_delta,
  '[]'::jsonb AS equipment_ids
FROM src s
LEFT JOIN t ON t.id = s.id
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

GRANT ALL ON FUNCTION public.fetch_equipment_modifiers_base(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipment_modifiers_base(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipment_modifiers_base(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

CREATE OR REPLACE FUNCTION public.update_equipment_modifier_base(
  p_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
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
    p_equipment_modifier || jsonb_build_object('kind', 'equipment_modifier'::public.resource_kind),
    p_equipment_modifier_translation
  );

  UPDATE public.equipment_modifiers em
  SET (
    cost_delta, make_magic, rarity_minimum,
    required_attunement_slots_minimum, weight_delta
  ) = (
    SELECT r.cost_delta, r.make_magic, r.rarity_minimum,
      r.required_attunement_slots_minimum, r.weight_delta
    FROM jsonb_populate_record(null::public.equipment_modifiers, to_jsonb(em) || p_equipment_modifier) AS r
  )
  WHERE em.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_equipment_modifier_translation(
    p_id,
    p_lang,
    p_equipment_modifier_translation
  );
END;
$$;

GRANT ALL ON FUNCTION public.update_equipment_modifier_base(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_equipment_modifier_base(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_equipment_modifier_base(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- ARMOR MODIFIER FUNCTIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_armor_modifier(
  p_source_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
BEGIN
  v_id := public.create_equipment_modifier_base(
    p_source_id,
    p_lang,
    p_equipment_modifier,
    p_equipment_modifier_translation
  );

  INSERT INTO public.armor_modifiers (resource_id)
  VALUES (v_id);

  INSERT INTO public.armor_modifier_applications (armor_id, armor_modifier_id)
  SELECT (value)::uuid, v_id
  FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.armor_modifier_applications ama
    WHERE ama.armor_id = (v.value)::uuid
      AND ama.armor_modifier_id = v_id
  );

  RETURN v_id;
END;
$$;

GRANT ALL ON FUNCTION public.create_armor_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_armor_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_armor_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_armor_modifier(p_id uuid)
RETURNS public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    b.source_id, b.source_code, b.source_version, b.id, b.kind, b.visibility,
    b.image_url, b.name, b.name_short, b.page,
    b.cost_delta, b.make_magic, b.rarity_minimum,
    b.required_attunement_slots_minimum, b.weight_delta,
    b.applies_to, b.attunement_notes_delta, b.composite_name, b.notes_delta,
    coalesce(ee.equipment_ids, '[]'::jsonb) AS equipment_ids
  FROM public.fetch_equipment_modifier_base(p_id) b
  JOIN public.armor_modifiers am ON am.resource_id = b.id
  LEFT JOIN (
    SELECT
      ama.armor_modifier_id AS id,
      jsonb_agg(ama.armor_id ORDER BY ama.armor_id) AS equipment_ids
    FROM public.armor_modifier_applications ama
    WHERE ama.armor_modifier_id = p_id
    GROUP BY ama.armor_modifier_id
  ) ee ON ee.id = b.id
  WHERE b.id = p_id;
$$;

GRANT ALL ON FUNCTION public.fetch_armor_modifier(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_armor_modifier(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_armor_modifier(p_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_armor_modifiers(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT b.*
  FROM public.fetch_equipment_modifiers_base(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) b
  JOIN public.armor_modifiers am ON am.resource_id = b.id
),
e AS (
  SELECT
    ama.armor_modifier_id AS id,
    jsonb_agg(ama.armor_id ORDER BY ama.armor_id) AS equipment_ids
  FROM public.armor_modifier_applications ama
  GROUP BY ama.armor_modifier_id
)
SELECT
  b.source_id, b.source_code, b.source_version, b.id, b.kind, b.visibility,
  b.image_url, b.name, b.name_short, b.page,
  b.cost_delta, b.make_magic, b.rarity_minimum,
  b.required_attunement_slots_minimum, b.weight_delta,
  b.applies_to, b.attunement_notes_delta, b.composite_name, b.notes_delta,
  coalesce(e.equipment_ids, '[]'::jsonb) AS equipment_ids
FROM base b
LEFT JOIN e ON e.id = b.id;
$$;

GRANT ALL ON FUNCTION public.fetch_armor_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_armor_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_armor_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

CREATE OR REPLACE FUNCTION public.update_armor_modifier(
  p_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  perform public.update_equipment_modifier_base(p_id, p_lang, p_equipment_modifier, p_equipment_modifier_translation);

  INSERT INTO public.armor_modifiers (resource_id)
  VALUES (p_id)
  ON CONFLICT (resource_id) DO NOTHING;

  IF p_equipment_modifier ? 'equipment_ids' THEN
    DELETE FROM public.armor_modifier_applications ama
    WHERE ama.armor_modifier_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
        WHERE (v.value)::uuid = ama.armor_id
      );

    INSERT INTO public.armor_modifier_applications (armor_id, armor_modifier_id)
    SELECT DISTINCT (v.value)::uuid, p_id
    FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.armor_modifier_applications ama
      WHERE ama.armor_id = (v.value)::uuid
        AND ama.armor_modifier_id = p_id
    );
  END IF;
END;
$$;

GRANT ALL ON FUNCTION public.update_armor_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_armor_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_armor_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- ITEM MODIFIER FUNCTIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_item_modifier(
  p_source_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
BEGIN
  v_id := public.create_equipment_modifier_base(
    p_source_id,
    p_lang,
    p_equipment_modifier,
    p_equipment_modifier_translation
  );

  INSERT INTO public.item_modifiers (resource_id)
  VALUES (v_id);

  INSERT INTO public.item_modifier_applications (item_id, item_modifier_id)
  SELECT (value)::uuid, v_id
  FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.item_modifier_applications ima
    WHERE ima.item_id = (v.value)::uuid
      AND ima.item_modifier_id = v_id
  );

  RETURN v_id;
END;
$$;

GRANT ALL ON FUNCTION public.create_item_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_item_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_item_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_item_modifier(p_id uuid)
RETURNS public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    b.source_id, b.source_code, b.source_version, b.id, b.kind, b.visibility,
    b.image_url, b.name, b.name_short, b.page,
    b.cost_delta, b.make_magic, b.rarity_minimum,
    b.required_attunement_slots_minimum, b.weight_delta,
    b.applies_to, b.attunement_notes_delta, b.composite_name, b.notes_delta,
    coalesce(ee.equipment_ids, '[]'::jsonb) AS equipment_ids
  FROM public.fetch_equipment_modifier_base(p_id) b
  JOIN public.item_modifiers im ON im.resource_id = b.id
  LEFT JOIN (
    SELECT
      ima.item_modifier_id AS id,
      jsonb_agg(ima.item_id ORDER BY ima.item_id) AS equipment_ids
    FROM public.item_modifier_applications ima
    WHERE ima.item_modifier_id = p_id
    GROUP BY ima.item_modifier_id
  ) ee ON ee.id = b.id
  WHERE b.id = p_id;
$$;

GRANT ALL ON FUNCTION public.fetch_item_modifier(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_item_modifier(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_item_modifier(p_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_item_modifiers(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT b.*
  FROM public.fetch_equipment_modifiers_base(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) b
  JOIN public.item_modifiers im ON im.resource_id = b.id
),
e AS (
  SELECT
    ima.item_modifier_id AS id,
    jsonb_agg(ima.item_id ORDER BY ima.item_id) AS equipment_ids
  FROM public.item_modifier_applications ima
  GROUP BY ima.item_modifier_id
)
SELECT
  b.source_id, b.source_code, b.source_version, b.id, b.kind, b.visibility,
  b.image_url, b.name, b.name_short, b.page,
  b.cost_delta, b.make_magic, b.rarity_minimum,
  b.required_attunement_slots_minimum, b.weight_delta,
  b.applies_to, b.attunement_notes_delta, b.composite_name, b.notes_delta,
  coalesce(e.equipment_ids, '[]'::jsonb) AS equipment_ids
FROM base b
LEFT JOIN e ON e.id = b.id;
$$;

GRANT ALL ON FUNCTION public.fetch_item_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_item_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_item_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

CREATE OR REPLACE FUNCTION public.update_item_modifier(
  p_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  perform public.update_equipment_modifier_base(p_id, p_lang, p_equipment_modifier, p_equipment_modifier_translation);

  INSERT INTO public.item_modifiers (resource_id)
  VALUES (p_id)
  ON CONFLICT (resource_id) DO NOTHING;

  IF p_equipment_modifier ? 'equipment_ids' THEN
    DELETE FROM public.item_modifier_applications ima
    WHERE ima.item_modifier_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
        WHERE (v.value)::uuid = ima.item_id
      );

    INSERT INTO public.item_modifier_applications (item_id, item_modifier_id)
    SELECT DISTINCT (v.value)::uuid, p_id
    FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.item_modifier_applications ima
      WHERE ima.item_id = (v.value)::uuid
        AND ima.item_modifier_id = p_id
    );
  END IF;
END;
$$;

GRANT ALL ON FUNCTION public.update_item_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_item_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_item_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- TOOL MODIFIER FUNCTIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_tool_modifier(
  p_source_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
BEGIN
  v_id := public.create_equipment_modifier_base(
    p_source_id,
    p_lang,
    p_equipment_modifier,
    p_equipment_modifier_translation
  );

  INSERT INTO public.tool_modifiers (resource_id)
  VALUES (v_id);

  INSERT INTO public.tool_modifier_applications (tool_id, tool_modifier_id)
  SELECT (value)::uuid, v_id
  FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.tool_modifier_applications tma
    WHERE tma.tool_id = (v.value)::uuid
      AND tma.tool_modifier_id = v_id
  );

  RETURN v_id;
END;
$$;

GRANT ALL ON FUNCTION public.create_tool_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_tool_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_tool_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_tool_modifier(p_id uuid)
RETURNS public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    b.source_id, b.source_code, b.source_version, b.id, b.kind, b.visibility,
    b.image_url, b.name, b.name_short, b.page,
    b.cost_delta, b.make_magic, b.rarity_minimum,
    b.required_attunement_slots_minimum, b.weight_delta,
    b.applies_to, b.attunement_notes_delta, b.composite_name, b.notes_delta,
    coalesce(ee.equipment_ids, '[]'::jsonb) AS equipment_ids
  FROM public.fetch_equipment_modifier_base(p_id) b
  JOIN public.tool_modifiers tm ON tm.resource_id = b.id
  LEFT JOIN (
    SELECT
      tma.tool_modifier_id AS id,
      jsonb_agg(tma.tool_id ORDER BY tma.tool_id) AS equipment_ids
    FROM public.tool_modifier_applications tma
    WHERE tma.tool_modifier_id = p_id
    GROUP BY tma.tool_modifier_id
  ) ee ON ee.id = b.id
  WHERE b.id = p_id;
$$;

GRANT ALL ON FUNCTION public.fetch_tool_modifier(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_tool_modifier(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_tool_modifier(p_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_tool_modifiers(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT b.*
  FROM public.fetch_equipment_modifiers_base(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) b
  JOIN public.tool_modifiers tm ON tm.resource_id = b.id
),
e AS (
  SELECT
    tma.tool_modifier_id AS id,
    jsonb_agg(tma.tool_id ORDER BY tma.tool_id) AS equipment_ids
  FROM public.tool_modifier_applications tma
  GROUP BY tma.tool_modifier_id
)
SELECT
  b.source_id, b.source_code, b.source_version, b.id, b.kind, b.visibility,
  b.image_url, b.name, b.name_short, b.page,
  b.cost_delta, b.make_magic, b.rarity_minimum,
  b.required_attunement_slots_minimum, b.weight_delta,
  b.applies_to, b.attunement_notes_delta, b.composite_name, b.notes_delta,
  coalesce(e.equipment_ids, '[]'::jsonb) AS equipment_ids
FROM base b
LEFT JOIN e ON e.id = b.id;
$$;

GRANT ALL ON FUNCTION public.fetch_tool_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_tool_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_tool_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

CREATE OR REPLACE FUNCTION public.update_tool_modifier(
  p_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  perform public.update_equipment_modifier_base(p_id, p_lang, p_equipment_modifier, p_equipment_modifier_translation);

  INSERT INTO public.tool_modifiers (resource_id)
  VALUES (p_id)
  ON CONFLICT (resource_id) DO NOTHING;

  IF p_equipment_modifier ? 'equipment_ids' THEN
    DELETE FROM public.tool_modifier_applications tma
    WHERE tma.tool_modifier_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
        WHERE (v.value)::uuid = tma.tool_id
      );

    INSERT INTO public.tool_modifier_applications (tool_id, tool_modifier_id)
    SELECT DISTINCT (v.value)::uuid, p_id
    FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.tool_modifier_applications tma
      WHERE tma.tool_id = (v.value)::uuid
        AND tma.tool_modifier_id = p_id
    );
  END IF;
END;
$$;

GRANT ALL ON FUNCTION public.update_tool_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_tool_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_tool_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- WEAPON MODIFIER FUNCTIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_weapon_modifier(
  p_source_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
BEGIN
  v_id := public.create_equipment_modifier_base(
    p_source_id,
    p_lang,
    p_equipment_modifier,
    p_equipment_modifier_translation
  );

  INSERT INTO public.weapon_modifiers (resource_id)
  VALUES (v_id);

  INSERT INTO public.weapon_modifier_applications (weapon_id, weapon_modifier_id)
  SELECT (value)::uuid, v_id
  FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.weapon_modifier_applications wma
    WHERE wma.weapon_id = (v.value)::uuid
      AND wma.weapon_modifier_id = v_id
  );

  RETURN v_id;
END;
$$;

GRANT ALL ON FUNCTION public.create_weapon_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_weapon_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_weapon_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_weapon_modifier(p_id uuid)
RETURNS public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    b.source_id, b.source_code, b.source_version, b.id, b.kind, b.visibility,
    b.image_url, b.name, b.name_short, b.page,
    b.cost_delta, b.make_magic, b.rarity_minimum,
    b.required_attunement_slots_minimum, b.weight_delta,
    b.applies_to, b.attunement_notes_delta, b.composite_name, b.notes_delta,
    coalesce(ee.equipment_ids, '[]'::jsonb) AS equipment_ids
  FROM public.fetch_equipment_modifier_base(p_id) b
  JOIN public.weapon_modifiers wm ON wm.resource_id = b.id
  LEFT JOIN (
    SELECT
      wma.weapon_modifier_id AS id,
      jsonb_agg(wma.weapon_id ORDER BY wma.weapon_id) AS equipment_ids
    FROM public.weapon_modifier_applications wma
    WHERE wma.weapon_modifier_id = p_id
    GROUP BY wma.weapon_modifier_id
  ) ee ON ee.id = b.id
  WHERE b.id = p_id;
$$;

GRANT ALL ON FUNCTION public.fetch_weapon_modifier(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_weapon_modifier(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_weapon_modifier(p_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_weapon_modifiers(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT b.*
  FROM public.fetch_equipment_modifiers_base(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) b
  JOIN public.weapon_modifiers wm ON wm.resource_id = b.id
),
e AS (
  SELECT
    wma.weapon_modifier_id AS id,
    jsonb_agg(wma.weapon_id ORDER BY wma.weapon_id) AS equipment_ids
  FROM public.weapon_modifier_applications wma
  GROUP BY wma.weapon_modifier_id
)
SELECT
  b.source_id, b.source_code, b.source_version, b.id, b.kind, b.visibility,
  b.image_url, b.name, b.name_short, b.page,
  b.cost_delta, b.make_magic, b.rarity_minimum,
  b.required_attunement_slots_minimum, b.weight_delta,
  b.applies_to, b.attunement_notes_delta, b.composite_name, b.notes_delta,
  coalesce(e.equipment_ids, '[]'::jsonb) AS equipment_ids
FROM base b
LEFT JOIN e ON e.id = b.id;
$$;

GRANT ALL ON FUNCTION public.fetch_weapon_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_weapon_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_weapon_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

CREATE OR REPLACE FUNCTION public.update_weapon_modifier(
  p_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  perform public.update_equipment_modifier_base(p_id, p_lang, p_equipment_modifier, p_equipment_modifier_translation);

  INSERT INTO public.weapon_modifiers (resource_id)
  VALUES (p_id)
  ON CONFLICT (resource_id) DO NOTHING;

  IF p_equipment_modifier ? 'equipment_ids' THEN
    DELETE FROM public.weapon_modifier_applications wma
    WHERE wma.weapon_modifier_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
        WHERE (v.value)::uuid = wma.weapon_id
      );

    INSERT INTO public.weapon_modifier_applications (weapon_id, weapon_modifier_id)
    SELECT DISTINCT (v.value)::uuid, p_id
    FROM jsonb_array_elements_text(coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)) v
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.weapon_modifier_applications wma
      WHERE wma.weapon_id = (v.value)::uuid
        AND wma.weapon_modifier_id = p_id
    );
  END IF;
END;
$$;

GRANT ALL ON FUNCTION public.update_weapon_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_weapon_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_weapon_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;
