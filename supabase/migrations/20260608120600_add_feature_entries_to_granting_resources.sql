--------------------------------------------------------------------------------
-- ADD FEATURE ENTRIES TO GRANTING RESOURCES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_resource_feature_entries(p_resource_id uuid)
RETURNS jsonb
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', rf.feature_id,
        'min_level', rf.min_level
      )
      ORDER BY rf.position, rf.feature_id
    ),
    '[]'::jsonb
  )
  FROM public.resource_features rf
  WHERE rf.resource_id = p_resource_id;
$$;

ALTER FUNCTION public.fetch_resource_feature_entries(p_resource_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_resource_feature_entries(p_resource_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_resource_feature_entries(p_resource_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_resource_feature_entries(p_resource_id uuid) TO service_role;


CREATE OR REPLACE FUNCTION public.replace_resource_feature_entries(
  p_resource_id uuid,
  p_feature_entries jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  DELETE FROM public.resource_features rf
  WHERE rf.resource_id = p_resource_id;

  INSERT INTO public.resource_features (
    resource_id,
    feature_id,
    min_level,
    position
  )
  SELECT
    p_resource_id,
    (e.value->>'id')::uuid,
    coalesce((e.value->>'min_level')::smallint, 0),
    (e.ordinality - 1)::smallint
  FROM jsonb_array_elements(coalesce(p_feature_entries, '[]'::jsonb)) WITH ORDINALITY AS e(value, ordinality);
END;
$$;

ALTER FUNCTION public.replace_resource_feature_entries(p_resource_id uuid, p_feature_entries jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.replace_resource_feature_entries(p_resource_id uuid, p_feature_entries jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_resource_feature_entries(p_resource_id uuid, p_feature_entries jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_resource_feature_entries(p_resource_id uuid, p_feature_entries jsonb) TO service_role;


DROP TYPE public.character_class_row CASCADE;
DROP TYPE public.character_subclass_row CASCADE;
DROP TYPE public.species_row CASCADE;
DROP TYPE public.feat_row CASCADE;
DROP TYPE public.equipment_row CASCADE;
DROP TYPE public.armor_row CASCADE;
DROP TYPE public.weapon_row CASCADE;
DROP TYPE public.item_row CASCADE;
DROP TYPE public.tool_row CASCADE;


--------------------------------------------------------------------------------
-- 30_character_class_functions.sql
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- CHARACTER CLASS ROW
--------------------------------------------------------------------------------

CREATE TYPE public.character_class_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Character Class
  armor_proficiencies public.armor_type[],
  hp_die public.die_type,
  primary_abilities public.creature_ability[],
  saving_throw_proficiencies public.creature_ability[],
  skill_proficiencies_pool public.creature_skill[],
  skill_proficiencies_pool_quantity smallint,
  starting_equipment_entries jsonb,
  tool_proficiency_ids uuid[],
  weapon_proficiencies public.weapon_type[],
  spell_ids uuid[],
  feature_entries jsonb,
  -- Character Class Translation
  armor_proficiencies_extra jsonb,
  weapon_proficiencies_extra jsonb
);


--------------------------------------------------------------------------------
-- CREATE CHARACTER CLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_character_class(
  p_source_id uuid,
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
    p_source_id,
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

  INSERT INTO public.character_class_starting_equipment (
    character_class_id,
    choice_group,
    choice_option,
    equipment_id,
    quantity
  )
  SELECT
    v_id,
    e.choice_group,
    e.choice_option,
    e.equipment_id,
    e.quantity
  FROM (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_character_class->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      quantity smallint
    )
    GROUP BY
      coalesce(e.choice_group, 1),
      e.choice_option,
      e.equipment_id
  ) e;

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

  perform public.replace_resource_feature_entries(
    v_id,
    coalesce(p_character_class->'feature_entries', '[]'::jsonb)
  );

  perform public.upsert_character_class_translation(
    v_id,
    p_lang,
    p_character_class_translation
  );

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_character_class(p_source_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_character_class(p_source_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_character_class(p_source_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_character_class(p_source_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CHARACTER CLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_character_class(p_id uuid)
RETURNS public.character_class_row
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
    c.armor_proficiencies,
    c.hp_die,
    c.primary_abilities,
    c.saving_throw_proficiencies,
    c.skill_proficiencies_pool,
    c.skill_proficiencies_pool_quantity,
    coalesce(se.starting_equipment_entries, '[]'::jsonb) AS starting_equipment_entries,
    coalesce(tp.tool_proficiency_ids, '{}'::uuid[]) AS tool_proficiency_ids,
    c.weapon_proficiencies,
    coalesce(s.spell_ids, '{}'::uuid[]) AS spell_ids,
    public.fetch_resource_feature_entries(r.id) AS feature_entries,
    coalesce(tt.armor_proficiencies_extra, '{}'::jsonb) AS armor_proficiencies_extra,
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
      se.character_class_id AS id,
      jsonb_agg(
        jsonb_build_object(
          'choice_group', se.choice_group,
          'choice_option', se.choice_option,
          'equipment_id', se.equipment_id,
          'quantity', se.quantity
        )
        ORDER BY se.choice_group, se.choice_option, se.id
      ) AS starting_equipment_entries
    FROM public.character_class_starting_equipment se
    WHERE se.character_class_id = p_id
    GROUP BY se.character_class_id
  ) se ON se.id = r.id
  LEFT JOIN (
    SELECT
      c.resource_id AS id,
      jsonb_object_agg(t.lang, t.armor_proficiencies_extra) AS armor_proficiencies_extra,
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
  p_source_id uuid,
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
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'character_class'::public.resource_kind
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
tse AS (
  SELECT
    se.character_class_id AS id,
    jsonb_agg(
      jsonb_build_object(
        'choice_group', se.choice_group,
        'choice_option', se.choice_option,
        'equipment_id', se.equipment_id,
        'quantity', se.quantity
      )
      ORDER BY se.choice_group, se.choice_option, se.id
    ) AS starting_equipment_entries
  FROM public.character_class_starting_equipment se
  GROUP BY se.character_class_id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.armor_proficiencies_extra) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS armor_proficiencies_extra,
    jsonb_object_agg(t.lang, t.weapon_proficiencies_extra) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS weapon_proficiencies_extra
  FROM src s
  LEFT JOIN public.character_class_translations t ON t.resource_id = s.id
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
  s.armor_proficiencies,
  s.hp_die,
  s.primary_abilities,
  s.saving_throw_proficiencies,
  s.skill_proficiencies_pool,
  s.skill_proficiencies_pool_quantity,
  coalesce(tse.starting_equipment_entries, '[]'::jsonb) AS starting_equipment_entries,
  coalesce(tools.tool_proficiency_ids, '{}'::uuid[]) AS tool_proficiency_ids,
  s.weapon_proficiencies,
  coalesce(sp.spell_ids, '{}'::uuid[]) AS spell_ids,
  public.fetch_resource_feature_entries(s.id) AS feature_entries,
  coalesce(tt.armor_proficiencies_extra, '{}'::jsonb) AS armor_proficiencies_extra,
  coalesce(tt.weapon_proficiencies_extra, '{}'::jsonb) AS weapon_proficiencies_extra
FROM src s
LEFT JOIN spells sp ON sp.id = s.id
LEFT JOIN tools ON tools.id = s.id
LEFT JOIN tse ON tse.id = s.id
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

ALTER FUNCTION public.fetch_character_classes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_character_classes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_character_classes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_character_classes(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


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
    armor_proficiencies_extra
  ) VALUES (
    p_id,
    p_lang,
    r.weapon_proficiencies_extra,
    r.armor_proficiencies_extra
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    weapon_proficiencies_extra = excluded.weapon_proficiencies_extra,
    armor_proficiencies_extra = excluded.armor_proficiencies_extra;
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

  WITH entries AS (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      sum(coalesce(e.quantity, 1))::smallint AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_character_class->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      quantity smallint
    )
    GROUP BY
      coalesce(e.choice_group, 1),
      e.choice_option,
      e.equipment_id
  )
  DELETE FROM public.character_class_starting_equipment se
  WHERE se.character_class_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.choice_group = se.choice_group
        AND e.choice_option = se.choice_option
        AND e.equipment_id IS NOT DISTINCT FROM se.equipment_id
        AND e.quantity = se.quantity
    );

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

  WITH entries AS (
    SELECT
      coalesce(e.choice_group, 1) AS choice_group,
      e.choice_option AS choice_option,
      e.equipment_id AS equipment_id,
      coalesce(e.quantity, 1) AS quantity
    FROM jsonb_to_recordset(
      coalesce(p_character_class->'starting_equipment_entries', '[]'::jsonb)
    ) AS e(
      choice_group smallint,
      choice_option smallint,
      equipment_id uuid,
      quantity smallint
    )
  )
  INSERT INTO public.character_class_starting_equipment (
    character_class_id,
    choice_group,
    choice_option,
    equipment_id,
    quantity
  )
  SELECT
    p_id,
    e.choice_group,
    e.choice_option,
    e.equipment_id,
    e.quantity
  FROM entries e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.character_class_starting_equipment se
    WHERE se.character_class_id = p_id
      AND se.choice_group = e.choice_group
      AND se.choice_option = e.choice_option
      AND se.equipment_id IS NOT DISTINCT FROM e.equipment_id
      AND se.quantity = e.quantity
  );

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

  IF p_character_class ? 'feature_entries' THEN
    perform public.replace_resource_feature_entries(
      p_id,
      p_character_class->'feature_entries'
    );
  END IF;

  perform public.upsert_character_class_translation(p_id, p_lang, p_character_class_translation);
END;
$$;

ALTER FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- 30_character_subclass_functions.sql
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- CHARACTER SUBCLASS ROW
--------------------------------------------------------------------------------

CREATE TYPE public.character_subclass_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Character Subclass
  character_class_id uuid,
  feature_entries jsonb
);


--------------------------------------------------------------------------------
-- CREATE CHARACTER SUBCLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_character_subclass(
  p_source_id uuid,
  p_lang text,
  p_character_subclass jsonb,
  p_character_subclass_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.character_subclasses%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_subclasses, p_character_subclass);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_character_subclass || jsonb_build_object('kind', 'character_subclass'::public.resource_kind),
    p_character_subclass_translation
  );

  INSERT INTO public.character_subclasses (
    resource_id, character_class_id
  ) VALUES (
    v_id, r.character_class_id
  );

  perform public.replace_resource_feature_entries(
    v_id,
    coalesce(p_character_subclass->'feature_entries', '[]'::jsonb)
  );

  perform public.upsert_character_subclass_translation(v_id, p_lang, p_character_subclass_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_character_subclass(p_source_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_character_subclass(p_source_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_character_subclass(p_source_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_character_subclass(p_source_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CHARACTER SUBCLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_character_subclass(p_id uuid)
RETURNS public.character_subclass_row
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
    s.character_class_id,
    public.fetch_resource_feature_entries(r.id) AS feature_entries
  FROM public.fetch_resource(p_id) AS r
  JOIN public.character_subclasses s ON s.resource_id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_character_subclass(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_character_subclass(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_character_subclass(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_character_subclass(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CHARACTER SUBCLASSES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_character_subclasses(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.character_subclass_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- class ids
    (
      SELECT coalesce(array_agg((e.key)::uuid), null)
      FROM jsonb_each_text(p_filters->'character_class_ids') AS e(key, value)
      WHERE e.value = 'true'
    ) AS class_ids_inc,
    (
      SELECT coalesce(array_agg((e.key)::uuid), null)
      FROM jsonb_each_text(p_filters->'character_class_ids') AS e(key, value)
      WHERE e.value = 'false'
    ) AS class_ids_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'character_subclass'::public.resource_kind
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
    s.character_class_id
  FROM base b
  JOIN public.character_subclasses s ON s.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (p.class_ids_inc IS NULL OR s.character_class_id = any(p.class_ids_inc))
    AND (p.class_ids_exc IS NULL OR NOT (s.character_class_id = any(p.class_ids_exc)))
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
  s.character_class_id,
  public.fetch_resource_feature_entries(s.id) AS feature_entries
FROM filtered s
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

ALTER FUNCTION public.fetch_character_subclasses(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_character_subclasses(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_character_subclasses(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_character_subclasses(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT CHARACTER SUBCLASS TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_character_subclass_translation(
  p_id uuid,
  p_lang text,
  p_character_subclass_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.character_subclass_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_subclass_translations, p_character_subclass_translation);

  INSERT INTO public.character_subclass_translations AS ct (
    resource_id, lang
  ) VALUES (
    p_id, p_lang
  )
  ON conflict (resource_id, lang) DO NOTHING;
END;
$$;

ALTER FUNCTION public.upsert_character_subclass_translation(p_id uuid, p_lang text, p_character_subclass_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_character_subclass_translation(p_id uuid, p_lang text, p_character_subclass_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_character_subclass_translation(p_id uuid, p_lang text, p_character_subclass_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_character_subclass_translation(p_id uuid, p_lang text, p_character_subclass_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE CHARACTER SUBCLASS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_character_subclass(
  p_id uuid,
  p_lang text,
  p_character_subclass jsonb,
  p_character_subclass_translation jsonb)
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
    p_character_subclass || jsonb_build_object('kind', 'character_subclass'::public.resource_kind),
    p_character_subclass_translation
  );

  UPDATE public.character_subclasses s
  SET (
    character_class_id
  ) = (
    SELECT r.character_class_id
    FROM jsonb_populate_record(null::public.character_subclasses, to_jsonb(s) || p_character_subclass) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_character_subclass ? 'feature_entries' THEN
    perform public.replace_resource_feature_entries(
      p_id,
      p_character_subclass->'feature_entries'
    );
  END IF;

  perform public.upsert_character_subclass_translation(p_id, p_lang, p_character_subclass_translation);
END;
$$;

ALTER FUNCTION public.update_character_subclass(p_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_character_subclass(p_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_character_subclass(p_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_character_subclass(p_id uuid, p_lang text, p_character_subclass jsonb, p_character_subclass_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- 30_species_functions.sql
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- SPECIES ROW
--------------------------------------------------------------------------------

CREATE TYPE public.species_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Species
  type public.creature_type,
  sizes public.creature_size[],
  speed integer,
  feature_entries jsonb,
  -- Species Translation
  description jsonb
);


--------------------------------------------------------------------------------
-- CREATE SPECIES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_species(
  p_source_id uuid,
  p_lang text,
  p_species jsonb,
  p_species_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.species%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.species, p_species);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_species || jsonb_build_object('kind', 'species'::public.resource_kind),
    p_species_translation
  );

  INSERT INTO public.species (
    resource_id, type, sizes, speed
  ) VALUES (
    v_id, r.type, r.sizes, r.speed
  );

  perform public.replace_resource_feature_entries(
    v_id,
    coalesce(p_species->'feature_entries', '[]'::jsonb)
  );

  perform public.upsert_species_translation(v_id, p_lang, p_species_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_species(p_source_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH SPECIES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_species(p_id uuid)
RETURNS public.species_row
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
    s.type,
    s.sizes,
    s.speed,
    public.fetch_resource_feature_entries(r.id) AS feature_entries,
    coalesce(tt.description, '{}'::jsonb) AS description
  FROM public.fetch_resource(p_id) AS r
  JOIN public.species s ON s.resource_id = r.id
  LEFT JOIN (
    SELECT
      s.resource_id AS id,
      jsonb_object_agg(t.lang, t.description) AS description
    FROM public.species s
    LEFT JOIN public.species_translations t ON t.resource_id = s.resource_id
    WHERE s.resource_id = p_id
    GROUP BY s.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_species(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_species(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_species(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_species(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH SPECIES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_species(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.species_row
LANGUAGE sql
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
      SELECT coalesce(array_agg(lower(e.key)::public.creature_size), null)
      FROM jsonb_each_text(p_filters->'sizes') AS e(key, value)
      WHERE e.value = 'true'
    ) AS sizes_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_size), null)
      FROM jsonb_each_text(p_filters->'sizes') AS e(key, value)
      WHERE e.value = 'false'
    ) AS sizes_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'species'::public.resource_kind
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
    s.type,
    s.sizes,
    s.speed
  FROM base b
  JOIN public.species s ON s.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
    AND (p.sizes_inc IS NULL OR s.sizes && p.sizes_inc)
    AND (p.sizes_exc IS NULL OR NOT (s.sizes && p.sizes_exc))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.description) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.species_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY f.id
)
SELECT
  f.source_id,
  f.source_code,
  f.source_version,
  f.id,
  f.kind,
  f.visibility,
  f.image_url,
  f.name,
  f.name_short,
  f.page,
  f.type,
  f.sizes,
  f.speed,
  public.fetch_resource_feature_entries(f.id) AS feature_entries,
  coalesce(tt.description, '{}'::jsonb) AS description
FROM filtered f
LEFT JOIN t tt ON tt.id = f.id
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

ALTER FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_species(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT SPECIES TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_species_translation(
  p_id uuid,
  p_lang text,
  p_species_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.species_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.species_translations, p_species_translation);

  INSERT INTO public.species_translations AS st (
    resource_id, lang, description
  ) VALUES (
    p_id, p_lang, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    description = excluded.description;

  perform public.upsert_resource_translation(p_id, p_lang, p_species_translation);
END;
$$;

ALTER FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_species_translation(p_id uuid, p_lang text, p_species_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE SPECIES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_species(
  p_id uuid,
  p_lang text,
  p_species jsonb,
  p_species_translation jsonb)
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
    p_species || jsonb_build_object('kind', 'species'::public.resource_kind),
    p_species_translation
  );

  UPDATE public.species s
  SET (
    type,
    sizes,
    speed
  ) = (
    SELECT r.type, r.sizes, r.speed
    FROM jsonb_populate_record(null::public.species, to_jsonb(s) || p_species) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_species ? 'feature_entries' THEN
    perform public.replace_resource_feature_entries(
      p_id,
      p_species->'feature_entries'
    );
  END IF;

  perform public.upsert_species_translation(p_id, p_lang, p_species_translation);
END;
$$;

ALTER FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_species(p_id uuid, p_lang text, p_species jsonb, p_species_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- 30_feat_functions.sql
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- FEAT ROW
--------------------------------------------------------------------------------

CREATE TYPE public.feat_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Feat
  category public.feat_category,
  min_level smallint,
  feature_entries jsonb,
  -- Feat Translation
  prerequisite jsonb,
  description jsonb
);


--------------------------------------------------------------------------------
-- CREATE FEAT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_feat(
  p_source_id uuid,
  p_lang text,
  p_feat jsonb,
  p_feat_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.feats%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.feats, p_feat);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_feat || jsonb_build_object('kind', 'feat'::public.resource_kind),
    p_feat_translation
  );

  INSERT INTO public.feats (
    resource_id, category, min_level
  ) VALUES (
    v_id, r.category, r.min_level
  );

  perform public.replace_resource_feature_entries(
    v_id,
    coalesce(p_feat->'feature_entries', '[]'::jsonb)
  );

  perform public.upsert_feat_translation(v_id, p_lang, p_feat_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_feat(p_source_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH FEAT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_feat(p_id uuid)
RETURNS public.feat_row
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
    f.category,
    f.min_level,
    public.fetch_resource_feature_entries(r.id) AS feature_entries,
    coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite,
    coalesce(tt.description, '{}'::jsonb) AS description
  FROM public.fetch_resource(p_id) AS r
  JOIN public.feats f ON f.resource_id = r.id
  LEFT JOIN (
    SELECT
      f.resource_id AS id,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description) AS description
    FROM public.feats f
    LEFT JOIN public.feat_translations t ON t.resource_id = f.resource_id
    WHERE f.resource_id = p_id
    GROUP BY f.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_feat(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_feat(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_feat(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_feat(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH FEATS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_feats(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.feat_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    coalesce((p_filters->>'level')::int, 20) AS level,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.feat_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'true'
    ) AS categories_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.feat_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'false'
    ) AS categories_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'feat'::public.resource_kind
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
    f.category,
    f.min_level
  FROM base b
  JOIN public.feats f ON f.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    s.min_level <= p.level
    AND (p.categories_inc IS NULL OR s.category = any(p.categories_inc))
    AND (p.categories_exc IS NULL OR NOT (s.category = any(p.categories_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.feat_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY f.id
)
SELECT
  f.source_id,
  f.source_code,
  f.source_version,
  f.id,
  f.kind,
  f.visibility,
  f.image_url,
  f.name,
  f.name_short,
  f.page,
  f.category,
  f.min_level,
  public.fetch_resource_feature_entries(f.id) AS feature_entries,
  coalesce(tt.prerequisite, '{}'::jsonb) AS prerequisite,
  coalesce(tt.description, '{}'::jsonb) AS description
FROM filtered f
LEFT JOIN t tt ON tt.id = f.id
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

ALTER FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_feats(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT FEAT TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_feat_translation(
  p_id uuid,
  p_lang text,
  p_feat_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.feat_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.feat_translations, p_feat_translation);

  INSERT INTO public.feat_translations AS ft (
    resource_id, lang, prerequisite, description
  ) VALUES (
    p_id, p_lang, r.prerequisite, r.description
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    prerequisite = excluded.prerequisite,
    description = excluded.description;

  perform public.upsert_resource_translation(p_id, p_lang, p_feat_translation);
END;
$$;

ALTER FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_feat_translation(p_id uuid, p_lang text, p_feat_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE FEAT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_feat(
  p_id uuid,
  p_lang text,
  p_feat jsonb,
  p_feat_translation jsonb)
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
    p_feat || jsonb_build_object('kind', 'feat'::public.resource_kind),
    p_feat_translation
  );

  UPDATE public.feats f
  SET (
    category,
    min_level
  ) = (
    SELECT r.category, r.min_level
    FROM jsonb_populate_record(null::public.feats, to_jsonb(f) || p_feat) AS r
  )
  WHERE f.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_feat ? 'feature_entries' THEN
    perform public.replace_resource_feature_entries(
      p_id,
      p_feat->'feature_entries'
    );
  END IF;

  perform public.upsert_feat_translation(p_id, p_lang, p_feat_translation);
END;
$$;

ALTER FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_feat(p_id uuid, p_lang text, p_feat jsonb, p_feat_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- 30_equipment_functions.sql
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- EQUIPMENT ROW
--------------------------------------------------------------------------------

CREATE TYPE public.equipment_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Equipment
  cost integer,
  magic boolean,
  rarity public.equipment_rarity,
  weight integer,
  feature_entries jsonb,
  -- Equipment Translation
  notes jsonb
);


--------------------------------------------------------------------------------
-- CREATE EQUIPMENT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_equipment(
  p_source_id uuid,
  p_lang text,
  p_equipment jsonb,
  p_equipment_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.equipments%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipments, p_equipment);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_equipment || jsonb_build_object(
      'kind',
      coalesce(
        (p_equipment->>'kind')::public.resource_kind,
        'equipment'::public.resource_kind
      )
    ),
    p_equipment_translation
  );

  INSERT INTO public.equipments (
    resource_id, cost, magic, rarity, weight
  ) VALUES (
    v_id, r.cost, r.magic, r.rarity, r.weight
  );

  perform public.replace_resource_feature_entries(
    v_id,
    coalesce(p_equipment->'feature_entries', '[]'::jsonb)
  );

  perform public.upsert_equipment_translation(v_id, p_lang, p_equipment_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_equipment(p_source_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_equipment(p_source_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_equipment(p_source_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_equipment(p_source_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH EQUIPMENT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_equipment(p_id uuid)
RETURNS public.equipment_row
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
    e.cost,
    e.magic,
    e.rarity,
    e.weight,
    public.fetch_resource_feature_entries(r.id) AS feature_entries,
    coalesce(tt.notes, '{}'::jsonb) AS notes
  FROM public.fetch_resource(p_id) AS r
  JOIN public.equipments e ON e.resource_id = r.id
  LEFT JOIN (
    SELECT
      e.resource_id AS id,
      jsonb_object_agg(t.lang, t.notes) AS notes
    FROM public.equipments e
    LEFT JOIN public.equipment_translations t ON t.resource_id = e.resource_id
    WHERE e.resource_id = p_id
    GROUP BY e.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_equipment(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_equipment(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipment(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipment(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH EQUIPMENTS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_equipments(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.equipment_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    (p_filters ? 'magic')::int::boolean   AS has_magic_filter,
    (p_filters->>'magic')::boolean        AS magic_val,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.equipment_rarity), null)
      FROM jsonb_each_text(p_filters->'rarities') AS e(key, value)
      WHERE e.value = 'true'
    ) AS rarity_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.equipment_rarity), null)
      FROM jsonb_each_text(p_filters->'rarities') AS e(key, value)
      WHERE e.value = 'false'
    ) AS rarity_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = any(ARRAY[
    'equipment'::public.resource_kind,
    'armor'::public.resource_kind,
    'weapon'::public.resource_kind,
    'tool'::public.resource_kind,
    'item'::public.resource_kind
  ])
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
    e.cost,
    e.magic,
    e.rarity,
    e.weight
  FROM base b
  JOIN public.equipments e ON e.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (not p.has_magic_filter OR s.magic = p.magic_val)
    AND (p.rarity_inc IS NULL OR s.rarity = any(p.rarity_inc))
    AND (p.rarity_exc IS NULL OR NOT (s.rarity = any(p.rarity_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.notes) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS notes
  FROM filtered f
  LEFT JOIN public.equipment_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.source_id,
  f.source_code,
  f.source_version,
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
  public.fetch_resource_feature_entries(f.id) AS feature_entries,
  coalesce(tt.notes, '{}'::jsonb) AS notes
FROM filtered f
LEFT JOIN t tt ON tt.id = f.id
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

ALTER FUNCTION public.fetch_equipments(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_equipments(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipments(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipments(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT EQUIPMENT TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_equipment_translation(
  p_id uuid,
  p_lang text,
  p_equipment_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.equipment_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipment_translations, p_equipment_translation);

  INSERT INTO public.equipment_translations AS et (
    resource_id, lang, notes
  ) VALUES (
    p_id, p_lang, r.notes
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    notes = excluded.notes;
END;
$$;

ALTER FUNCTION public.upsert_equipment_translation(p_id uuid, p_lang text, p_equipment_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_equipment_translation(p_id uuid, p_lang text, p_equipment_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_equipment_translation(p_id uuid, p_lang text, p_equipment_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_equipment_translation(p_id uuid, p_lang text, p_equipment_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE EQUIPMENT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_equipment(
  p_id uuid,
  p_lang text,
  p_equipment jsonb,
  p_equipment_translation jsonb)
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
    p_equipment || jsonb_build_object(
      'kind',
      coalesce(
        (p_equipment->>'kind')::public.resource_kind,
        'equipment'::public.resource_kind
      )
    ),
    p_equipment_translation
  );

  UPDATE public.equipments e
  SET (
    cost, magic, rarity, weight
  ) = (
    SELECT r.cost, r.magic, r.rarity, r.weight
    FROM jsonb_populate_record(null::public.equipments, to_jsonb(e) || p_equipment) AS r
  )
  WHERE e.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_equipment ? 'feature_entries' THEN
    perform public.replace_resource_feature_entries(
      p_id,
      p_equipment->'feature_entries'
    );
  END IF;

  perform public.upsert_equipment_translation(p_id, p_lang, p_equipment_translation);
END;
$$;

ALTER FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- 31_armor_functions.sql
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- ARMOR ROW
--------------------------------------------------------------------------------

CREATE TYPE public.armor_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Equipment
  cost integer,
  magic boolean,
  rarity public.equipment_rarity,
  weight integer,
  feature_entries jsonb,
  -- Armor
  armor_class_max_cha_modifier smallint,
  armor_class_max_con_modifier smallint,
  armor_class_max_dex_modifier smallint,
  armor_class_max_int_modifier smallint,
  armor_class_max_str_modifier smallint,
  armor_class_max_wis_modifier smallint,
  armor_class_modifier smallint,
  base_armor_class smallint,
  disadvantage_on_stealth boolean,
  required_cha smallint,
  required_con smallint,
  required_dex smallint,
  required_int smallint,
  required_str smallint,
  required_wis smallint,
  type public.armor_type,
  -- Translation
  notes jsonb
);


--------------------------------------------------------------------------------
-- CREATE ARMOR
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_armor(
  p_source_id uuid,
  p_lang text,
  p_armor jsonb,
  p_armor_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.armors%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.armors, p_armor);

  v_id := public.create_equipment(
    p_source_id,
    p_lang,
    p_armor || jsonb_build_object('kind', 'armor'::public.resource_kind),
    p_armor_translation
  );

  INSERT INTO public.armors (
    resource_id,
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type
  ) VALUES (
    v_id,
    r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
    r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
    r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
    r.armor_class_modifier, r.base_armor_class,
    r.disadvantage_on_stealth,
    r.required_cha, r.required_con, r.required_dex,
    r.required_int, r.required_str, r.required_wis,
    r.type
  );

  perform public.upsert_armor_translation(v_id, p_lang, p_armor_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_armor(p_source_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_armor(p_source_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_armor(p_source_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_armor(p_source_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ARMOR
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_armor(p_id uuid)
RETURNS public.armor_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.source_id,
    e.source_code,
    e.source_version,
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
    e.feature_entries,
    a.armor_class_max_cha_modifier,
    a.armor_class_max_con_modifier,
    a.armor_class_max_dex_modifier,
    a.armor_class_max_int_modifier,
    a.armor_class_max_str_modifier,
    a.armor_class_max_wis_modifier,
    a.armor_class_modifier,
    a.base_armor_class,
    a.disadvantage_on_stealth,
    a.required_cha,
    a.required_con,
    a.required_dex,
    a.required_int,
    a.required_str,
    a.required_wis,
    a.type,
    e.notes
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.armors a ON a.resource_id = e.id
  WHERE e.id = p_id;
$$;

ALTER FUNCTION public.fetch_armor(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_armor(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_armor(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_armor(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ARMORS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_armors(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.armor_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.armor_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.armor_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc
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
    b.source_version,
    b.kind,
    b.visibility,
    b.image_url,
    b.name,
    b.name_short,
    b.page,
    b.notes,
    b.feature_entries,
    a.armor_class_max_cha_modifier,
    a.armor_class_max_con_modifier,
    a.armor_class_max_dex_modifier,
    a.armor_class_max_int_modifier,
    a.armor_class_max_str_modifier,
    a.armor_class_max_wis_modifier,
    a.armor_class_modifier,
    a.base_armor_class,
    a.disadvantage_on_stealth,
    a.required_cha,
    a.required_con,
    a.required_dex,
    a.required_int,
    a.required_str,
    a.required_wis,
    a.type,
    e.cost,
    e.magic,
    e.rarity,
    e.weight
  FROM base b
  JOIN public.armors a ON a.resource_id = b.id
  JOIN public.equipments e ON e.resource_id = b.id
  JOIN prefs p ON true
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    -- types
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
)
SELECT
  f.source_id,
  f.source_code,
  f.source_version,
  f.id,
  f.kind,
  f.visibility,
  f.image_url,
  f.name                          AS name,
  f.name_short                    AS name_short,
  f.page                          AS page,
  f.cost,
  f.magic,
  f.rarity,
  f.weight,
  f.feature_entries,
  f.armor_class_max_cha_modifier,
  f.armor_class_max_con_modifier,
  f.armor_class_max_dex_modifier,
  f.armor_class_max_int_modifier,
  f.armor_class_max_str_modifier,
  f.armor_class_max_wis_modifier,
  f.armor_class_modifier,
  f.base_armor_class,
  f.disadvantage_on_stealth,
  f.required_cha,
  f.required_con,
  f.required_dex,
  f.required_int,
  f.required_str,
  f.required_wis,
  f.type,
  f.notes                         AS notes
FROM filtered f
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

ALTER FUNCTION public.fetch_armors(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_armors(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_armors(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_armors(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT ARMOR TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_armor_translation(
  p_id uuid,
  p_lang text,
  p_armor_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.armor_translations AS at (resource_id, lang)
  VALUES (p_id, p_lang)
  ON conflict (resource_id, lang) DO NOTHING;

  perform public.upsert_resource_translation(p_id, p_lang, p_armor_translation);
  perform public.upsert_equipment_translation(p_id, p_lang, p_armor_translation);
END;
$$;

ALTER FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE ARMOR
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_armor(
  p_id uuid,
  p_lang text,
  p_armor jsonb,
  p_armor_translation jsonb)
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
    p_armor || jsonb_build_object('kind', 'armor'::public.resource_kind),
    p_armor_translation
  );

  UPDATE public.armors s
  SET (
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type
  ) = (
    SELECT r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
      r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
      r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
      r.armor_class_modifier, r.base_armor_class,
      r.disadvantage_on_stealth,
      r.required_cha, r.required_con, r.required_dex,
      r.required_int, r.required_str, r.required_wis,
      r.type
    FROM jsonb_populate_record(null::public.armors, to_jsonb(s) || p_armor) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_armor_translation(p_id, p_lang, p_armor_translation);
END;
$$;

ALTER FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- 31_weapon_functions.sql
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- WEAPON ROW
--------------------------------------------------------------------------------

CREATE TYPE public.weapon_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Equipment
  cost integer,
  magic boolean,
  rarity public.equipment_rarity,
  weight integer,
  feature_entries jsonb,
  -- Weapon
  damage text,
  damage_type public.damage_type,
  damage_versatile text,
  mastery public.weapon_mastery,
  melee boolean,
  properties public.weapon_property[],
  range_long integer,
  range_short integer,
  ranged boolean,
  type public.weapon_type,
  -- Translation
  ammunition_ids uuid[],
  notes jsonb
);


--------------------------------------------------------------------------------
-- CREATE WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_weapon(
  p_source_id uuid,
  p_lang text,
  p_weapon jsonb,
  p_weapon_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.weapons%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.weapons, p_weapon);

  v_id := public.create_equipment(
    p_source_id,
    p_lang,
    p_weapon || jsonb_build_object('kind', 'weapon'::public.resource_kind),
    p_weapon_translation
  );

  INSERT INTO public.weapons (
    resource_id, type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged,
    range_short, range_long
  ) VALUES (
    v_id, r.type, r.damage, r.damage_versatile, r.damage_type,
    r.properties, r.mastery, r.melee, r.ranged,
    r.range_short, r.range_long
  );

  INSERT INTO public.weapon_ammunitions (weapon_id, equipment_id)
  SELECT
    v_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_weapon->'ammunition_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.weapon_ammunitions wa
    WHERE wa.weapon_id = v_id
      AND wa.equipment_id = (v.value)::uuid
  );

  perform public.upsert_weapon_translation(v_id, p_lang, p_weapon_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_weapon(p_source_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_weapon(p_source_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_weapon(p_source_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_weapon(p_source_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_weapon(p_id uuid)
RETURNS public.weapon_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.source_id,
    e.source_code,
    e.source_version,
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
    e.feature_entries,
    w.damage,
    w.damage_type,
    w.damage_versatile,
    w.mastery,
    w.melee,
    w.properties,
    w.range_long,
    w.range_short,
    w.ranged,
    w.type,
    coalesce(wa.ammunition_ids, '{}'::uuid[])  AS ammunition_ids,
    e.notes
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.weapons w ON w.resource_id = e.id
  LEFT JOIN (
    SELECT
      wa.weapon_id AS id,
      array_agg(wa.equipment_id ORDER BY wa.equipment_id) AS ammunition_ids
    FROM public.weapon_ammunitions wa
    WHERE wa.weapon_id = p_id
    GROUP BY wa.weapon_id
  ) wa ON wa.id = e.id
  LEFT JOIN (
    SELECT
      w.resource_id AS id
    FROM public.weapons w
    LEFT JOIN public.weapon_translations t ON t.resource_id = w.resource_id
    WHERE w.resource_id = p_id
    GROUP BY w.resource_id
  ) tt ON tt.id = e.id
  WHERE e.id = p_id;
$$;

ALTER FUNCTION public.fetch_weapon(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_weapon(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_weapon(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_weapon(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH WEAPONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_weapons(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.weapon_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.weapon_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.weapon_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc,

    -- properties
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      FROM jsonb_each_text(p_filters->'properties') AS e(key, value)
      WHERE e.value = 'true'
    ) AS properties_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      FROM jsonb_each_text(p_filters->'properties') AS e(key, value)
      WHERE e.value = 'false'
    ) AS properties_exc,

    -- mastery
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      FROM jsonb_each_text(p_filters->'masteries') AS e(key, value)
      WHERE e.value = 'true'
    ) AS masteries_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      FROM jsonb_each_text(p_filters->'masteries') AS e(key, value)
      WHERE e.value = 'false'
    ) AS masteries_exc,

    -- boolean flags; null = not relevant
    (p_filters ? 'melee')::int::boolean   AS has_melee_filter,
    (p_filters->>'melee')::boolean        AS melee_val,

    (p_filters ? 'ranged')::int::boolean  AS has_ranged_filter,
    (p_filters->>'ranged')::boolean       AS ranged_val
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
    b.source_version,
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
    b.feature_entries,
    b.notes,
    w.type,
    w.damage,
    w.damage_type,
    w.damage_versatile,
    w.mastery,
    w.properties,
    w.melee,
    w.ranged,
    w.range_long,
    w.range_short
  FROM base b
  JOIN public.weapons w ON w.resource_id = b.id
  JOIN prefs p ON true
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    -- types
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))

    -- properties
    AND (p.properties_inc IS NULL OR s.properties && p.properties_inc)
    AND (p.properties_exc IS NULL OR NOT (s.properties && p.properties_exc))

    -- masteries
    AND (p.masteries_inc IS NULL OR s.mastery = any(p.masteries_inc))
    AND (p.masteries_exc IS NULL OR NOT (s.mastery = any(p.masteries_exc)))

    -- flags
    AND (NOT p.has_melee_filter  OR s.melee  = p.melee_val)
    AND (NOT p.has_ranged_filter OR s.ranged = p.ranged_val)
),
t AS (
  SELECT
    f.id
  FROM filtered f
  LEFT JOIN public.weapon_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
),
wa AS (
  SELECT
    wa.weapon_id AS id,
    array_agg(wa.equipment_id ORDER BY wa.equipment_id) AS ammunition_ids
  FROM public.weapon_ammunitions wa
  GROUP BY wa.weapon_id
)
SELECT
  f.source_id,
  f.source_code,
  f.source_version,
  f.id,
  f.kind,
  f.visibility,
  f.image_url,
  f.name                          AS name,
  f.name_short                    AS name_short,
  f.page                          AS page,
  f.cost,
  f.magic,
  f.rarity,
  f.weight,
  f.feature_entries,
  f.damage,
  f.damage_type,
  f.damage_versatile,
  f.mastery,
  f.melee,
  f.properties,
  f.range_long,
  f.range_short,
  f.ranged,
  f.type,
  coalesce(wa.ammunition_ids, '{}'::uuid[])  AS ammunition_ids,
  f.notes                        AS notes
FROM filtered f
LEFT JOIN t tt ON tt.id = f.id
LEFT JOIN wa ON wa.id = f.id
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

ALTER FUNCTION public.fetch_weapons(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_weapons(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_weapons(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_weapons(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT WEAPON TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_weapon_translation(
  p_id uuid,
  p_lang text,
  p_weapon_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.weapon_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.weapon_translations, p_weapon_translation);

  INSERT INTO public.weapon_translations AS wt (
    resource_id, lang
  ) VALUES (
    p_id, p_lang
  )
  ON conflict (resource_id, lang) DO NOTHING;

  perform public.upsert_resource_translation(p_id, p_lang, p_weapon_translation);
  perform public.upsert_equipment_translation(p_id, p_lang, p_weapon_translation);
END;
$$;

ALTER FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_weapon_translation(p_id uuid, p_lang text, p_weapon_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE WEAPON
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_weapon(
  p_id uuid,
  p_lang text,
  p_weapon jsonb,
  p_weapon_translation jsonb)
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
    p_weapon || jsonb_build_object('kind', 'weapon'::public.resource_kind),
    p_weapon_translation
  );

  UPDATE public.weapons s
  SET (
    type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged,
    range_short, range_long
  ) = (
    SELECT r.type, r.damage, r.damage_versatile, r.damage_type,
           r.properties, r.mastery, r.melee, r.ranged,
           r.range_short, r.range_long
    FROM jsonb_populate_record(null::public.weapons, to_jsonb(s) || p_weapon) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  WITH entries AS (
    SELECT
      (value)::uuid AS equipment_id
    FROM jsonb_array_elements_text(
      coalesce(p_weapon->'ammunition_ids', '[]'::jsonb)
    )
  )
  DELETE FROM public.weapon_ammunitions wa
  WHERE wa.weapon_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.equipment_id = wa.equipment_id
    );

  WITH entries AS (
    SELECT
      (value)::uuid AS equipment_id
    FROM jsonb_array_elements_text(
      coalesce(p_weapon->'ammunition_ids', '[]'::jsonb)
    )
  )
  INSERT INTO public.weapon_ammunitions (weapon_id, equipment_id)
  SELECT
    p_id,
    e.equipment_id
  FROM (
    SELECT DISTINCT equipment_id FROM entries
  ) e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.weapon_ammunitions wa
    WHERE wa.weapon_id = p_id
      AND wa.equipment_id = e.equipment_id
  );

  perform public.upsert_weapon_translation(p_id, p_lang, p_weapon_translation);
END;
$$;

ALTER FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_weapon(p_id uuid, p_lang text, p_weapon jsonb, p_weapon_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- 31_item_functions.sql
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- ITEM ROW
--------------------------------------------------------------------------------

CREATE TYPE public.item_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Equipment
  cost integer,
  magic boolean,
  rarity public.equipment_rarity,
  weight integer,
  feature_entries jsonb,
  -- Item Translation
  type public.item_type,
  charges integer,
  consumable boolean,
  notes jsonb
);


--------------------------------------------------------------------------------
-- CREATE ITEM
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_item(
  p_source_id uuid,
  p_lang text,
  p_item jsonb,
  p_item_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.items%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.items, p_item);
  v_id := public.create_equipment(
    p_source_id,
    p_lang,
    p_item || jsonb_build_object('kind', 'item'::public.resource_kind),
    p_item_translation
  );

  INSERT INTO public.items (resource_id, type, charges, consumable)
  VALUES (v_id, r.type, r.charges, r.consumable);

  perform public.upsert_item_translation(v_id, p_lang, p_item_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_item(p_source_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_item(p_source_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_item(p_source_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_item(p_source_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ITEM
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_item(p_id uuid)
RETURNS public.item_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.source_id,
    e.source_code,
    e.source_version,
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
    e.feature_entries,
    i.type,
    i.charges,
    i.consumable,
    e.notes
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.items i ON i.resource_id = e.id
  WHERE e.id = p_id;
$$;

ALTER FUNCTION public.fetch_item(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_item(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_item(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_item(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ITEMS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_items(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.item_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.item_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.item_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc
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
    b.source_version,
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
    b.feature_entries,
    i.type,
    i.charges,
    i.consumable,
    b.notes
  FROM base b
  JOIN public.items i ON i.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
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
  s.cost,
  s.magic,
  s.rarity,
  s.weight,
  s.feature_entries,
  s.type,
  s.charges,
  s.consumable,
  s.notes
FROM filtered s
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

ALTER FUNCTION public.fetch_items(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_items(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_items(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_items(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT ITEM TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_item_translation(
  p_id uuid,
  p_lang text,
  p_item_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
BEGIN
  INSERT INTO public.item_translations AS it (resource_id, lang)
  VALUES (p_id, p_lang)
  ON conflict (resource_id, lang) DO NOTHING;

  perform public.upsert_resource_translation(p_id, p_lang, p_item_translation);
  perform public.upsert_equipment_translation(p_id, p_lang, p_item_translation);
END;
$$;

ALTER FUNCTION public.upsert_item_translation(p_id uuid, p_lang text, p_item_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_item_translation(p_id uuid, p_lang text, p_item_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_item_translation(p_id uuid, p_lang text, p_item_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_item_translation(p_id uuid, p_lang text, p_item_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE ITEM
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_item(
  p_id uuid,
  p_lang text,
  p_item jsonb,
  p_item_translation jsonb)
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
    p_item || jsonb_build_object('kind', 'item'::public.resource_kind),
    p_item_translation
  );

  UPDATE public.items i
  SET (
    type,
    charges,
    consumable
  ) = (
    SELECT r.type, r.charges, r.consumable
    FROM jsonb_populate_record(null::public.items, to_jsonb(i) || p_item) AS r
  )
  WHERE i.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_item_translation(p_id, p_lang, p_item_translation);
END;
$$;

ALTER FUNCTION public.update_item(p_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_item(p_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_item(p_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_item(p_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO service_role;

--------------------------------------------------------------------------------
-- 31_tool_functions.sql
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- TOOL ROW
--------------------------------------------------------------------------------

CREATE TYPE public.tool_row AS (
  -- Resource
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  -- Equipment
  cost integer,
  magic boolean,
  rarity public.equipment_rarity,
  weight integer,
  feature_entries jsonb,
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
    e.source_version,
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
    e.feature_entries,
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
    b.source_version,
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
    b.feature_entries,
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
  f.source_version,
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
  f.feature_entries,
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
