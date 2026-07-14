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
    ) AS types_exc,

    -- consumable
    (p_filters ? 'consumable')::int::boolean AS has_consumable_filter,
    (p_filters->>'consumable')::boolean AS consumable_val,

    -- charges
    coalesce((p_filters->>'charges_min')::int, 0) AS charges_min
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
    b.notes,
    b.required_attunement_slots,
    b.attunement_notes,
    b.modifier_ids
  FROM base b
  JOIN public.items i ON i.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
    AND (NOT p.has_consumable_filter OR s.consumable = p.consumable_val)
    AND (p.charges_min <= 0 OR s.charges >= p.charges_min)
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
  s.notes,
  s.required_attunement_slots,
  s.attunement_notes,
  s.modifier_ids
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
