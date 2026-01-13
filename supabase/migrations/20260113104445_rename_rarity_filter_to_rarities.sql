CREATE OR REPLACE FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.equipment_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;


