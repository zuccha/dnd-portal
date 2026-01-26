DROP FUNCTION public.fetch_resource(p_id uuid);
DROP FUNCTION public.fetch_resources(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

drop function if exists "public"."fetch_resource_lookup"(p_id uuid);

drop function if exists "public"."fetch_resource_lookups"(p_campaign_id uuid, p_resource_kinds public.resource_kind[]);

drop type "public"."resource_row";

alter table "public"."resource_translations" add column "name_short" text not null default ''::text;

create type "public"."resource_row" as ("id" uuid, "campaign_id" uuid, "campaign_name" text, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "name_short" jsonb, "page" jsonb);

CREATE OR REPLACE FUNCTION public.fetch_resource(p_id uuid)
 RETURNS public.resource_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    r.id,
    r.campaign_id,
    c.name                          AS campaign_name,
    r.kind,
    r.visibility,
    coalesce(tt.name, '{}'::jsonb)  AS name,
    coalesce(tt.name_short, '{}'::jsonb) AS name_short,
    coalesce(tt.page, '{}'::jsonb)  AS page
  FROM public.resources r
  JOIN public.campaigns c ON c.id = r.campaign_id
  LEFT JOIN (
    SELECT
      r.id,
      jsonb_object_agg(t.lang, t.name) AS name,
      jsonb_object_agg(t.lang, t.name_short) AS name_short,
      jsonb_object_agg(t.lang, t.page) AS page
    FROM public.resources r
    LEFT JOIN public.resource_translations t ON t.resource_id = r.id
    WHERE r.id = p_id
    GROUP BY r.id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_resource_lookup(p_id uuid)
 RETURNS TABLE(id uuid, name jsonb, name_short jsonb)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    r.id,
    coalesce(tt.name, '{}'::jsonb) AS name,
    coalesce(tt.name_short, '{}'::jsonb) AS name_short
  FROM public.resources r
  LEFT JOIN (
    SELECT
      rt.resource_id AS id,
      jsonb_object_agg(rt.lang, rt.name) AS name,
      jsonb_object_agg(rt.lang, rt.name_short) AS name_short
    FROM public.resource_translations rt
    WHERE rt.resource_id = p_id
    GROUP BY rt.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_resource_lookups(p_campaign_id uuid, p_resource_kinds public.resource_kind[])
 RETURNS TABLE(id uuid, name jsonb, name_short jsonb)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH campaign_ids AS (
    SELECT id
    FROM public.campaign_resource_ids_with_deps(p_campaign_id, '{}'::jsonb)
  )
  SELECT
    r.id,
    coalesce(tt.name, '{}'::jsonb) AS name,
    coalesce(tt.name_short, '{}'::jsonb) AS name_short
  FROM public.resources r
  JOIN campaign_ids cids ON cids.id = r.campaign_id
  LEFT JOIN (
    SELECT
      rt.resource_id AS id,
      jsonb_object_agg(rt.lang, rt.name) AS name,
      jsonb_object_agg(rt.lang, rt.name_short) AS name_short
    FROM public.resource_translations rt
    GROUP BY rt.resource_id
  ) tt ON tt.id = r.id
  WHERE r.kind = any(p_resource_kinds)
  ORDER BY r.id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_resources(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.resource_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    -- campaign/modules include/exclude filter (keys are campaign or module ids)
    coalesce(p_filters->'campaigns', '{}'::jsonb) AS campaign_filter,

    -- kinds
    (
      SELECT coalesce(array_agg(lower(e.key)::public.resource_kind), null)
      FROM jsonb_each_text(p_filters->'kinds') AS e(key, value)
      WHERE e.value = 'true'
    ) AS kinds_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.resource_kind), null)
      FROM jsonb_each_text(p_filters->'kinds') AS e(key, value)
      WHERE e.value = 'false'
    ) AS kinds_exc
),
src AS (
  SELECT r.*
  FROM public.resources r
  JOIN prefs p ON true
  JOIN public.campaign_resource_ids(p_campaign_id, p.campaign_filter) ci ON ci.id = r.campaign_id
  JOIN public.campaigns c ON c.id = r.campaign_id
),
filtered AS (
  SELECT r.*
  FROM src r, prefs p
  WHERE
    (p.kinds_inc IS NULL OR r.kind = any(p.kinds_inc))
    AND (p.kinds_exc IS NULL OR NOT (r.kind = any(p.kinds_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name) AS name,
    jsonb_object_agg(t.lang, t.name_short) AS name_short,
    jsonb_object_agg(t.lang, t.page) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS page
  FROM filtered f
  LEFT JOIN public.resource_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  c.name                        AS campaign_name,
  f.kind,
  f.visibility,
  coalesce(tt.name, '{}'::jsonb) AS name,
  coalesce(tt.name_short, '{}'::jsonb) AS name_short,
  coalesce(tt.page, '{}'::jsonb) AS page
FROM filtered f
JOIN public.campaigns c ON c.id = f.campaign_id
LEFT JOIN t tt ON tt.id = f.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (tt.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (tt.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_resource_translation(p_id uuid, p_lang text, p_resource_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  r public.resource_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.resource_translations, p_resource_translation);

  INSERT INTO public.resource_translations AS rt (
    resource_id, lang, name, name_short, page
  ) VALUES (
    p_id, p_lang, r.name, r.name_short, r.page
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    name = excluded.name,
    name_short = excluded.name_short,
    page = excluded.page;
END;
$function$
;


