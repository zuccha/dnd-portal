UPDATE public.resources r
SET kind = 'armor_modifier'::public.resource_kind
FROM public.armor_modifiers am
WHERE am.resource_id = r.id
  AND r.kind = 'equipment_modifier'::public.resource_kind;

UPDATE public.resources r
SET kind = 'item_modifier'::public.resource_kind
FROM public.item_modifiers im
WHERE im.resource_id = r.id
  AND r.kind = 'equipment_modifier'::public.resource_kind;

UPDATE public.resources r
SET kind = 'tool_modifier'::public.resource_kind
FROM public.tool_modifiers tm
WHERE tm.resource_id = r.id
  AND r.kind = 'equipment_modifier'::public.resource_kind;

UPDATE public.resources r
SET kind = 'weapon_modifier'::public.resource_kind
FROM public.weapon_modifiers wm
WHERE wm.resource_id = r.id
  AND r.kind = 'equipment_modifier'::public.resource_kind;

CREATE OR REPLACE FUNCTION public.validate_modifier_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind IN (
        'equipment_modifier'::public.resource_kind,
        'armor_modifier'::public.resource_kind,
        'item_modifier'::public.resource_kind,
        'tool_modifier'::public.resource_kind,
        'weapon_modifier'::public.resource_kind
      )
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a modifier', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_equipment_modifier_base(
  p_source_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb,
  p_kind public.resource_kind DEFAULT 'equipment_modifier'::public.resource_kind)
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
    p_equipment_modifier || jsonb_build_object('kind', p_kind),
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

CREATE OR REPLACE FUNCTION public.update_equipment_modifier_base(
  p_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb,
  p_kind public.resource_kind DEFAULT 'equipment_modifier'::public.resource_kind)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.equipment_modifiers%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipment_modifiers, p_equipment_modifier);

  perform public.update_resource(
    p_id,
    p_lang,
    p_equipment_modifier || jsonb_build_object('kind', p_kind),
    p_equipment_modifier_translation
  );

  UPDATE public.equipment_modifiers
  SET
    cost_delta = coalesce(r.cost_delta, cost_delta),
    make_magic = coalesce(r.make_magic, make_magic),
    rarity_minimum = coalesce(r.rarity_minimum, rarity_minimum),
    required_attunement_slots_minimum = coalesce(
      r.required_attunement_slots_minimum,
      required_attunement_slots_minimum
    ),
    weight_delta = coalesce(r.weight_delta, weight_delta)
  WHERE resource_id = p_id;

  perform public.upsert_equipment_modifier_translation(
    p_id,
    p_lang,
    p_equipment_modifier_translation
  );
END;
$$;

GRANT ALL ON FUNCTION public.create_equipment_modifier_base(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb, p_kind public.resource_kind) TO anon;
GRANT ALL ON FUNCTION public.create_equipment_modifier_base(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb, p_kind public.resource_kind) TO authenticated;
GRANT ALL ON FUNCTION public.create_equipment_modifier_base(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb, p_kind public.resource_kind) TO service_role;

GRANT ALL ON FUNCTION public.update_equipment_modifier_base(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb, p_kind public.resource_kind) TO anon;
GRANT ALL ON FUNCTION public.update_equipment_modifier_base(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb, p_kind public.resource_kind) TO authenticated;
GRANT ALL ON FUNCTION public.update_equipment_modifier_base(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb, p_kind public.resource_kind) TO service_role;

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
  WHERE r.kind IN (
    'equipment_modifier'::public.resource_kind,
    'armor_modifier'::public.resource_kind,
    'item_modifier'::public.resource_kind,
    'tool_modifier'::public.resource_kind,
    'weapon_modifier'::public.resource_kind
  )
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

DROP FUNCTION IF EXISTS public.create_armor_modifier(uuid, text, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.create_item_modifier(uuid, text, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.create_tool_modifier(uuid, text, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.create_weapon_modifier(uuid, text, jsonb, jsonb);

DROP FUNCTION IF EXISTS public.update_armor_modifier(uuid, text, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.update_item_modifier(uuid, text, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.update_tool_modifier(uuid, text, jsonb, jsonb);
DROP FUNCTION IF EXISTS public.update_weapon_modifier(uuid, text, jsonb, jsonb);

CREATE OR REPLACE FUNCTION public.create_armor_modifier(
  p_source_id uuid,
  p_lang text,
  p_armor_modifier jsonb,
  p_armor_modifier_translation jsonb)
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
    p_armor_modifier,
    p_armor_modifier_translation,
    'armor_modifier'::public.resource_kind
  );

  INSERT INTO public.armor_modifiers (resource_id)
  VALUES (v_id);

  INSERT INTO public.armor_modifier_applications (armor_id, armor_modifier_id)
  SELECT (value)::uuid, v_id
  FROM jsonb_array_elements_text(coalesce(p_armor_modifier->'equipment_ids', '[]'::jsonb)) v
  ON CONFLICT DO NOTHING;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_item_modifier(
  p_source_id uuid,
  p_lang text,
  p_item_modifier jsonb,
  p_item_modifier_translation jsonb)
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
    p_item_modifier,
    p_item_modifier_translation,
    'item_modifier'::public.resource_kind
  );

  INSERT INTO public.item_modifiers (resource_id)
  VALUES (v_id);

  INSERT INTO public.item_modifier_applications (item_id, item_modifier_id)
  SELECT (value)::uuid, v_id
  FROM jsonb_array_elements_text(coalesce(p_item_modifier->'equipment_ids', '[]'::jsonb)) v
  ON CONFLICT DO NOTHING;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_tool_modifier(
  p_source_id uuid,
  p_lang text,
  p_tool_modifier jsonb,
  p_tool_modifier_translation jsonb)
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
    p_tool_modifier,
    p_tool_modifier_translation,
    'tool_modifier'::public.resource_kind
  );

  INSERT INTO public.tool_modifiers (resource_id)
  VALUES (v_id);

  INSERT INTO public.tool_modifier_applications (tool_id, tool_modifier_id)
  SELECT (value)::uuid, v_id
  FROM jsonb_array_elements_text(coalesce(p_tool_modifier->'equipment_ids', '[]'::jsonb)) v
  ON CONFLICT DO NOTHING;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_weapon_modifier(
  p_source_id uuid,
  p_lang text,
  p_weapon_modifier jsonb,
  p_weapon_modifier_translation jsonb)
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
    p_weapon_modifier,
    p_weapon_modifier_translation,
    'weapon_modifier'::public.resource_kind
  );

  INSERT INTO public.weapon_modifiers (resource_id)
  VALUES (v_id);

  INSERT INTO public.weapon_modifier_applications (weapon_id, weapon_modifier_id)
  SELECT (value)::uuid, v_id
  FROM jsonb_array_elements_text(coalesce(p_weapon_modifier->'equipment_ids', '[]'::jsonb)) v
  ON CONFLICT DO NOTHING;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_armor_modifier(
  p_id uuid,
  p_lang text,
  p_armor_modifier jsonb,
  p_armor_modifier_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  perform public.update_equipment_modifier_base(
    p_id,
    p_lang,
    p_armor_modifier,
    p_armor_modifier_translation,
    'armor_modifier'::public.resource_kind
  );

  INSERT INTO public.armor_modifiers (resource_id)
  VALUES (p_id)
  ON CONFLICT (resource_id) DO NOTHING;

  IF p_armor_modifier ? 'equipment_ids' THEN
    perform public.replace_armor_modifier_applications(
      p_id,
      p_armor_modifier->'equipment_ids'
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_item_modifier(
  p_id uuid,
  p_lang text,
  p_item_modifier jsonb,
  p_item_modifier_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  perform public.update_equipment_modifier_base(
    p_id,
    p_lang,
    p_item_modifier,
    p_item_modifier_translation,
    'item_modifier'::public.resource_kind
  );

  INSERT INTO public.item_modifiers (resource_id)
  VALUES (p_id)
  ON CONFLICT (resource_id) DO NOTHING;

  IF p_item_modifier ? 'equipment_ids' THEN
    perform public.replace_item_modifier_applications(
      p_id,
      p_item_modifier->'equipment_ids'
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_tool_modifier(
  p_id uuid,
  p_lang text,
  p_tool_modifier jsonb,
  p_tool_modifier_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  perform public.update_equipment_modifier_base(
    p_id,
    p_lang,
    p_tool_modifier,
    p_tool_modifier_translation,
    'tool_modifier'::public.resource_kind
  );

  INSERT INTO public.tool_modifiers (resource_id)
  VALUES (p_id)
  ON CONFLICT (resource_id) DO NOTHING;

  IF p_tool_modifier ? 'equipment_ids' THEN
    perform public.replace_tool_modifier_applications(
      p_id,
      p_tool_modifier->'equipment_ids'
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_weapon_modifier(
  p_id uuid,
  p_lang text,
  p_weapon_modifier jsonb,
  p_weapon_modifier_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  perform public.update_equipment_modifier_base(
    p_id,
    p_lang,
    p_weapon_modifier,
    p_weapon_modifier_translation,
    'weapon_modifier'::public.resource_kind
  );

  INSERT INTO public.weapon_modifiers (resource_id)
  VALUES (p_id)
  ON CONFLICT (resource_id) DO NOTHING;

  IF p_weapon_modifier ? 'equipment_ids' THEN
    perform public.replace_weapon_modifier_applications(
      p_id,
      p_weapon_modifier->'equipment_ids'
    );
  END IF;
END;
$$;

GRANT ALL ON FUNCTION public.create_armor_modifier(p_source_id uuid, p_lang text, p_armor_modifier jsonb, p_armor_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_armor_modifier(p_source_id uuid, p_lang text, p_armor_modifier jsonb, p_armor_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_armor_modifier(p_source_id uuid, p_lang text, p_armor_modifier jsonb, p_armor_modifier_translation jsonb) TO service_role;

GRANT ALL ON FUNCTION public.create_item_modifier(p_source_id uuid, p_lang text, p_item_modifier jsonb, p_item_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_item_modifier(p_source_id uuid, p_lang text, p_item_modifier jsonb, p_item_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_item_modifier(p_source_id uuid, p_lang text, p_item_modifier jsonb, p_item_modifier_translation jsonb) TO service_role;

GRANT ALL ON FUNCTION public.create_tool_modifier(p_source_id uuid, p_lang text, p_tool_modifier jsonb, p_tool_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_tool_modifier(p_source_id uuid, p_lang text, p_tool_modifier jsonb, p_tool_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_tool_modifier(p_source_id uuid, p_lang text, p_tool_modifier jsonb, p_tool_modifier_translation jsonb) TO service_role;

GRANT ALL ON FUNCTION public.create_weapon_modifier(p_source_id uuid, p_lang text, p_weapon_modifier jsonb, p_weapon_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_weapon_modifier(p_source_id uuid, p_lang text, p_weapon_modifier jsonb, p_weapon_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_weapon_modifier(p_source_id uuid, p_lang text, p_weapon_modifier jsonb, p_weapon_modifier_translation jsonb) TO service_role;

GRANT ALL ON FUNCTION public.update_armor_modifier(p_id uuid, p_lang text, p_armor_modifier jsonb, p_armor_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_armor_modifier(p_id uuid, p_lang text, p_armor_modifier jsonb, p_armor_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_armor_modifier(p_id uuid, p_lang text, p_armor_modifier jsonb, p_armor_modifier_translation jsonb) TO service_role;

GRANT ALL ON FUNCTION public.update_item_modifier(p_id uuid, p_lang text, p_item_modifier jsonb, p_item_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_item_modifier(p_id uuid, p_lang text, p_item_modifier jsonb, p_item_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_item_modifier(p_id uuid, p_lang text, p_item_modifier jsonb, p_item_modifier_translation jsonb) TO service_role;

GRANT ALL ON FUNCTION public.update_tool_modifier(p_id uuid, p_lang text, p_tool_modifier jsonb, p_tool_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_tool_modifier(p_id uuid, p_lang text, p_tool_modifier jsonb, p_tool_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_tool_modifier(p_id uuid, p_lang text, p_tool_modifier jsonb, p_tool_modifier_translation jsonb) TO service_role;

GRANT ALL ON FUNCTION public.update_weapon_modifier(p_id uuid, p_lang text, p_weapon_modifier jsonb, p_weapon_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_weapon_modifier(p_id uuid, p_lang text, p_weapon_modifier jsonb, p_weapon_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_weapon_modifier(p_id uuid, p_lang text, p_weapon_modifier jsonb, p_weapon_modifier_translation jsonb) TO service_role;
