--------------------------------------------------------------------------------
-- EQUIPMENT ROW
--------------------------------------------------------------------------------

CREATE TYPE public.equipment_row AS (
  -- Resource
  campaign_id uuid,
  campaign_name text,
  id uuid,
  kind public.resource_kind,
  visibility public.campaign_role,
  name jsonb,
  page jsonb,
  -- Equipment
  cost integer,
  magic boolean,
  rarity public.equipment_rarity,
  weight integer,
  -- Equipment Translation
  notes jsonb
);


--------------------------------------------------------------------------------
-- CREATE EQUIPMENT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_equipment(
  p_campaign_id uuid,
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
    p_campaign_id,
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

  perform public.upsert_equipment_translation(v_id, p_lang, p_equipment_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_equipment(p_campaign_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_equipment(p_campaign_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_equipment(p_campaign_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_equipment(p_campaign_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH EQUIPMENT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_equipment(p_id uuid)
RETURNS public.equipment_row
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
    e.cost,
    e.magic,
    e.rarity,
    e.weight,
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
  p_campaign_id uuid,
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
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
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
    b.campaign_id,
    b.campaign_name,
    b.kind,
    b.visibility,
    b.name,
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
  f.campaign_id,
  f.campaign_name,
  f.id,
  f.kind,
  f.visibility,
  f.name,
  f.page,
  f.cost,
  f.magic,
  f.rarity,
  f.weight,
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

ALTER FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


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

  perform public.upsert_equipment_translation(p_id, p_lang, p_equipment_translation);
END;
$$;

ALTER FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO service_role;
