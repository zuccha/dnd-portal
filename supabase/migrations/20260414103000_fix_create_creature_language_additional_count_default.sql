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
