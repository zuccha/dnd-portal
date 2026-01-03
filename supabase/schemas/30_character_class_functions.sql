--------------------------------------------------------------------------------
-- CHARACTER CLASS ROW
--------------------------------------------------------------------------------

CREATE TYPE public.character_class_row AS (
  -- Resource
  campaign_id uuid,
  campaign_name text,
  id uuid,
  kind public.resource_kind,
  visibility public.campaign_role,
  name jsonb,
  page jsonb,
  -- Character Class
  armor_proficiencies public.armor_type[],
  hp_die public.die_type,
  primary_abilities public.creature_ability[],
  saving_throw_proficiencies public.creature_ability[],
  skill_proficiencies_pool public.creature_skill[],
  skill_proficiencies_pool_quantity smallint,
  tool_proficiency_ids uuid[],
  weapon_proficiencies public.weapon_type[],
  spell_ids uuid[],
  -- Character Class Translation
  armor_proficiencies_extra jsonb,
  starting_equipment jsonb,
  weapon_proficiencies_extra jsonb
);


--------------------------------------------------------------------------------
-- CREATE CHARACTER CLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_character_class(
  p_campaign_id uuid,
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
    p_campaign_id,
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

  perform public.upsert_character_class_translation(
    v_id,
    p_lang,
    p_character_class_translation
  );

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_character_class(p_campaign_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_character_class(p_campaign_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_character_class(p_campaign_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_character_class(p_campaign_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CHARACTER CLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_character_class(p_id uuid)
RETURNS public.character_class_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.campaign_id,
    r.campaign_name,
    r.id,
    r.kind,
    r.visibility,
    r.name,
    r.page,
    c.armor_proficiencies,
    c.hp_die,
    c.primary_abilities,
    c.saving_throw_proficiencies,
    c.skill_proficiencies_pool,
    c.skill_proficiencies_pool_quantity,
    coalesce(tp.tool_proficiency_ids, '{}'::uuid[]) AS tool_proficiency_ids,
    c.weapon_proficiencies,
    coalesce(s.spell_ids, '{}'::uuid[]) AS spell_ids,
    coalesce(tt.armor_proficiencies_extra, '{}'::jsonb) AS armor_proficiencies_extra,
    coalesce(tt.starting_equipment, '{}'::jsonb) AS starting_equipment,
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
      c.resource_id AS id,
      jsonb_object_agg(t.lang, t.armor_proficiencies_extra) AS armor_proficiencies_extra,
      jsonb_object_agg(t.lang, t.starting_equipment) AS starting_equipment,
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


--------------------------------------------------------------------------------
-- FETCH CHARACTER CLASSES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_character_classes(
  p_campaign_id uuid,
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
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'character_class'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.campaign_id,
    b.campaign_name,
    b.kind,
    b.visibility,
    b.name,
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
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.armor_proficiencies_extra) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS armor_proficiencies_extra,
    jsonb_object_agg(t.lang, t.starting_equipment)        FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS starting_equipment,
    jsonb_object_agg(t.lang, t.weapon_proficiencies_extra) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS weapon_proficiencies_extra
  FROM src s
  LEFT JOIN public.character_class_translations t ON t.resource_id = s.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY s.id
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.page,
  s.armor_proficiencies,
  s.hp_die,
  s.primary_abilities,
  s.saving_throw_proficiencies,
  s.skill_proficiencies_pool,
  s.skill_proficiencies_pool_quantity,
  coalesce(tools.tool_proficiency_ids, '{}'::uuid[]) AS tool_proficiency_ids,
  s.weapon_proficiencies,
  coalesce(sp.spell_ids, '{}'::uuid[]) AS spell_ids,
  coalesce(tt.armor_proficiencies_extra, '{}'::jsonb) AS armor_proficiencies_extra,
  coalesce(tt.starting_equipment, '{}'::jsonb) AS starting_equipment,
  coalesce(tt.weapon_proficiencies_extra, '{}'::jsonb) AS weapon_proficiencies_extra
FROM src s
LEFT JOIN spells sp ON sp.id = s.id
LEFT JOIN tools ON tools.id = s.id
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

ALTER FUNCTION public.fetch_character_classes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_character_classes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_character_classes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_character_classes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT CHARACTER CLASS TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_character_class_translation(
  p_id uuid,
  p_lang text,
  p_character_class_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.character_class_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_class_translations, p_character_class_translation);

  INSERT INTO public.character_class_translations AS ct (
    resource_id,
    lang,
    weapon_proficiencies_extra,
    armor_proficiencies_extra,
    starting_equipment
  ) VALUES (
    p_id,
    p_lang,
    r.weapon_proficiencies_extra,
    r.armor_proficiencies_extra,
    r.starting_equipment
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    weapon_proficiencies_extra = excluded.weapon_proficiencies_extra,
    armor_proficiencies_extra = excluded.armor_proficiencies_extra,
    starting_equipment = excluded.starting_equipment;
END;
$$;

ALTER FUNCTION public.upsert_character_class_translation(p_id uuid, p_lang text, p_character_class_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_character_class_translation(p_id uuid, p_lang text, p_character_class_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_character_class_translation(p_id uuid, p_lang text, p_character_class_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_character_class_translation(p_id uuid, p_lang text, p_character_class_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
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

  perform public.upsert_character_class_translation(p_id, p_lang, p_character_class_translation);
END;
$$;

ALTER FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO service_role;
