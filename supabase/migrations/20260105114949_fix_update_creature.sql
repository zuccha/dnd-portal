CREATE OR REPLACE FUNCTION public.update_creature(p_id uuid, p_lang text, p_creature jsonb, p_creature_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
    initiative, passive_perception, ability_proficiencies, skill_proficiencies, skill_expertise,
    damage_immunities, damage_resistances, damage_vulnerabilities,
    condition_immunities, condition_resistances, condition_vulnerabilities,
    blindsight, darkvision, tremorsense, truesight
  ) = (
    SELECT r.type, r.alignment, r.size, r.habitats, r.treasures, r.cr, r.ac, r.hp, r.hp_formula,
      r.speed_walk, r.speed_fly, r.speed_swim, r.speed_climb, r.speed_burrow,
      r.ability_str, r.ability_dex, r.ability_con, r.ability_int, r.ability_wis, r.ability_cha,
      r.initiative, r.passive_perception, r.ability_proficiencies, r.skill_proficiencies, r.skill_expertise,
      r.damage_immunities, r.damage_resistances, r.damage_vulnerabilities,
      r.condition_immunities, r.condition_resistances, r.condition_vulnerabilities,
      r.blindsight, r.darkvision, r.tremorsense, r.truesight
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

  perform public.upsert_creature_translation(p_id, p_lang, p_creature_translation);
END;
$function$
;


