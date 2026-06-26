--------------------------------------------------------------------------------
-- EQUIPMENT MODIFIER ROW
--------------------------------------------------------------------------------

CREATE TYPE public.equipment_modifier_row AS (
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
  -- Equipment Modifier
  cost_delta integer,
  make_magic boolean,
  rarity_minimum public.equipment_rarity,
  required_attunement_slots_minimum smallint,
  weight_delta integer,
  -- Modifier Translation
  applies_to jsonb,
  attunement_notes_delta jsonb,
  composite_name jsonb,
  -- Equipment Modifier Translation
  notes_delta jsonb,
  -- Concrete Modifier Applications
  equipment_ids jsonb
);


--------------------------------------------------------------------------------
-- CREATE EQUIPMENT MODIFIER BASE
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

ALTER FUNCTION public.create_equipment_modifier_base(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_equipment_modifier_base(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_equipment_modifier_base(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_equipment_modifier_base(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH EQUIPMENT MODIFIER BASE
--------------------------------------------------------------------------------

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

ALTER FUNCTION public.fetch_equipment_modifier_base(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_equipment_modifier_base(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipment_modifier_base(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipment_modifier_base(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH EQUIPMENT MODIFIERS BASE
--------------------------------------------------------------------------------

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
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
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

ALTER FUNCTION public.fetch_equipment_modifiers_base(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_equipment_modifiers_base(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipment_modifiers_base(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipment_modifiers_base(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT EQUIPMENT MODIFIER TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_equipment_modifier_translation(
  p_id uuid,
  p_lang text,
  p_equipment_modifier_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.equipment_modifier_translations%ROWTYPE;
  mr public.modifier_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipment_modifier_translations, p_equipment_modifier_translation);
  mr := jsonb_populate_record(null::public.modifier_translations, p_equipment_modifier_translation);

  INSERT INTO public.modifier_translations AS mt (
    resource_id, lang, applies_to, composite_name
  ) VALUES (
    p_id, p_lang, mr.applies_to, coalesce(mr.composite_name, '{base}'::text)
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    applies_to = excluded.applies_to,
    composite_name = excluded.composite_name;

  INSERT INTO public.equipment_modifier_translations AS emt (
    resource_id, lang, attunement_notes_delta, notes_delta
  ) VALUES (
    p_id, p_lang, r.attunement_notes_delta, r.notes_delta
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    attunement_notes_delta = excluded.attunement_notes_delta,
    notes_delta = excluded.notes_delta;
END;
$$;

ALTER FUNCTION public.upsert_equipment_modifier_translation(p_id uuid, p_lang text, p_equipment_modifier_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_equipment_modifier_translation(p_id uuid, p_lang text, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_equipment_modifier_translation(p_id uuid, p_lang text, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_equipment_modifier_translation(p_id uuid, p_lang text, p_equipment_modifier_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE EQUIPMENT MODIFIER BASE
--------------------------------------------------------------------------------

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

ALTER FUNCTION public.update_equipment_modifier_base(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_equipment_modifier_base(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_equipment_modifier_base(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_equipment_modifier_base(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;
