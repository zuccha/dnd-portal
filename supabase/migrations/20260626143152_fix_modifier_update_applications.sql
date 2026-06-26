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
    DELETE FROM public.armor_modifier_applications ama
    WHERE ama.armor_modifier_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(
          coalesce(p_armor_modifier->'equipment_ids', '[]'::jsonb)
        ) v
        WHERE (v.value)::uuid = ama.armor_id
      );

    INSERT INTO public.armor_modifier_applications (armor_id, armor_modifier_id)
    SELECT DISTINCT
      (v.value)::uuid,
      p_id
    FROM jsonb_array_elements_text(
      coalesce(p_armor_modifier->'equipment_ids', '[]'::jsonb)
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
    DELETE FROM public.item_modifier_applications ima
    WHERE ima.item_modifier_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(
          coalesce(p_item_modifier->'equipment_ids', '[]'::jsonb)
        ) v
        WHERE (v.value)::uuid = ima.item_id
      );

    INSERT INTO public.item_modifier_applications (item_id, item_modifier_id)
    SELECT DISTINCT
      (v.value)::uuid,
      p_id
    FROM jsonb_array_elements_text(
      coalesce(p_item_modifier->'equipment_ids', '[]'::jsonb)
    ) v
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.item_modifier_applications ima
      WHERE ima.item_id = (v.value)::uuid
        AND ima.item_modifier_id = p_id
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
    DELETE FROM public.tool_modifier_applications tma
    WHERE tma.tool_modifier_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(
          coalesce(p_tool_modifier->'equipment_ids', '[]'::jsonb)
        ) v
        WHERE (v.value)::uuid = tma.tool_id
      );

    INSERT INTO public.tool_modifier_applications (tool_id, tool_modifier_id)
    SELECT DISTINCT
      (v.value)::uuid,
      p_id
    FROM jsonb_array_elements_text(
      coalesce(p_tool_modifier->'equipment_ids', '[]'::jsonb)
    ) v
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.tool_modifier_applications tma
      WHERE tma.tool_id = (v.value)::uuid
        AND tma.tool_modifier_id = p_id
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
    DELETE FROM public.weapon_modifier_applications wma
    WHERE wma.weapon_modifier_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(
          coalesce(p_weapon_modifier->'equipment_ids', '[]'::jsonb)
        ) v
        WHERE (v.value)::uuid = wma.weapon_id
      );

    INSERT INTO public.weapon_modifier_applications (weapon_id, weapon_modifier_id)
    SELECT DISTINCT
      (v.value)::uuid,
      p_id
    FROM jsonb_array_elements_text(
      coalesce(p_weapon_modifier->'equipment_ids', '[]'::jsonb)
    ) v
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.weapon_modifier_applications wma
      WHERE wma.weapon_id = (v.value)::uuid
        AND wma.weapon_modifier_id = p_id
    );
  END IF;
END;
$$;

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
