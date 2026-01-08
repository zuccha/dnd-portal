drop function public.fetch_plane(uuid);
drop function public.fetch_planes(uuid, text[], jsonb, text, text);

drop type "public"."plane_row";

alter type "public"."plane_category" rename to "plane_category__old_version_to_be_dropped";

create type "public"."plane_category" as enum ('material', 'transitive', 'inner', 'outer', 'other');

alter table "public"."planes" alter column category type "public"."plane_category" using category::text::"public"."plane_category";

drop type "public"."plane_category__old_version_to_be_dropped";

create type "public"."plane_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "category" public.plane_category, "alignments" public.creature_alignment[]);

--------------------------------------------------------------------------------
-- FETCH PLANE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_plane(p_id uuid)
RETURNS public.plane_row
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
    p.category,
    p.alignments
  FROM public.fetch_resource(p_id) AS r
  JOIN public.planes p ON p.resource_id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_plane(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_plane(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_plane(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_plane(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH PLANES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_planes(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.plane_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    (
      SELECT coalesce(array_agg(lower(e.key)::public.plane_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'true'
    ) AS categories_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.plane_category), null)
      FROM jsonb_each_text(p_filters->'categories') AS e(key, value)
      WHERE e.value = 'false'
    ) AS categories_exc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_alignment), null)
      FROM jsonb_each_text(p_filters->'alignments') AS e(key, value)
      WHERE e.value = 'true'
    ) AS alignments_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_alignment), null)
      FROM jsonb_each_text(p_filters->'alignments') AS e(key, value)
      WHERE e.value = 'false'
    ) AS alignments_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'plane'::public.resource_kind
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
    p.category,
    p.alignments
  FROM base b
  JOIN public.planes p ON p.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    (p.categories_inc IS NULL OR s.category = any(p.categories_inc))
    AND (p.categories_exc IS NULL OR NOT (s.category = any(p.categories_exc)))
    AND (p.alignments_inc IS NULL OR s.alignments && p.alignments_inc)
    AND (p.alignments_exc IS NULL OR NOT (s.alignments && p.alignments_exc))
)
SELECT
  f.campaign_id,
  f.campaign_name,
  f.id,
  f.kind,
  f.visibility,
  f.name,
  f.page,
  f.category,
  f.alignments
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

ALTER FUNCTION public.fetch_planes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_planes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_planes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_planes(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

