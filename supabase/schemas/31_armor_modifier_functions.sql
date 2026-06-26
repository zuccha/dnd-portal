--------------------------------------------------------------------------------
-- CREATE ARMOR MODIFIER
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
  SELECT
    (value)::uuid,
    v_id
  FROM jsonb_array_elements_text(
    coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.armor_modifier_applications ama
    WHERE ama.armor_id = (v.value)::uuid
      AND ama.armor_modifier_id = v_id
  );

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_armor_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_armor_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_armor_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_armor_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.create_equipment_modifier(
  p_source_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS uuid
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT public.create_armor_modifier(
    p_source_id,
    p_lang,
    p_equipment_modifier,
    p_equipment_modifier_translation
  );
$$;

ALTER FUNCTION public.create_equipment_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_equipment_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_equipment_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_equipment_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ARMOR MODIFIER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_armor_modifier(p_id uuid)
RETURNS public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    b.source_id,
    b.source_code,
    b.source_version,
    b.id,
    b.kind,
    b.visibility,
    b.image_url,
    b.name,
    b.name_short,
    b.page,
    b.cost_delta,
    b.make_magic,
    b.rarity_minimum,
    b.required_attunement_slots_minimum,
    b.weight_delta,
    b.applies_to,
    b.attunement_notes_delta,
    b.composite_name,
    b.notes_delta,
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

ALTER FUNCTION public.fetch_armor_modifier(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_armor_modifier(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_armor_modifier(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_armor_modifier(p_id uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_equipment_modifier(p_id uuid)
RETURNS public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT *
  FROM public.fetch_armor_modifier(p_id);
$$;

ALTER FUNCTION public.fetch_equipment_modifier(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_equipment_modifier(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipment_modifier(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipment_modifier(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ARMOR MODIFIERS
--------------------------------------------------------------------------------

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
  FROM public.fetch_equipment_modifiers_base(
    p_source_id,
    p_langs,
    p_filters,
    p_order_by,
    p_order_dir
  ) b
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
  b.source_id,
  b.source_code,
  b.source_version,
  b.id,
  b.kind,
  b.visibility,
  b.image_url,
  b.name,
  b.name_short,
  b.page,
  b.cost_delta,
  b.make_magic,
  b.rarity_minimum,
  b.required_attunement_slots_minimum,
  b.weight_delta,
  b.applies_to,
  b.attunement_notes_delta,
  b.composite_name,
  b.notes_delta,
  coalesce(e.equipment_ids, '[]'::jsonb) AS equipment_ids
FROM base b
LEFT JOIN e ON e.id = b.id;
$$;

ALTER FUNCTION public.fetch_armor_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_armor_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_armor_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_armor_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

CREATE OR REPLACE FUNCTION public.fetch_equipment_modifiers(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT *
  FROM public.fetch_armor_modifiers(
    p_source_id,
    p_langs,
    p_filters,
    p_order_by,
    p_order_dir
  );
$$;

ALTER FUNCTION public.fetch_equipment_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_equipment_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipment_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipment_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE ARMOR MODIFIER
--------------------------------------------------------------------------------

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
  perform public.update_equipment_modifier_base(
    p_id,
    p_lang,
    p_equipment_modifier,
    p_equipment_modifier_translation
  );

  INSERT INTO public.armor_modifiers (resource_id)
  VALUES (p_id)
  ON CONFLICT (resource_id) DO NOTHING;

  IF p_equipment_modifier ? 'equipment_ids' THEN
    DELETE FROM public.armor_modifier_applications ama
    WHERE ama.armor_modifier_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(
          coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)
        ) v
        WHERE (v.value)::uuid = ama.armor_id
      );

    INSERT INTO public.armor_modifier_applications (armor_id, armor_modifier_id)
    SELECT DISTINCT
      (v.value)::uuid,
      p_id
    FROM jsonb_array_elements_text(
      coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)
    ) v
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.armor_modifier_applications ama
      WHERE ama.armor_id = (v.value)::uuid
        AND ama.armor_modifier_id = p_id
    );
  END IF;
END;
$$;

ALTER FUNCTION public.update_armor_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_armor_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_armor_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_armor_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.update_equipment_modifier(
  p_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS void
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT public.update_armor_modifier(
    p_id,
    p_lang,
    p_equipment_modifier,
    p_equipment_modifier_translation
  );
$$;

ALTER FUNCTION public.update_equipment_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_equipment_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_equipment_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_equipment_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;
