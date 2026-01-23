DROP FUNCTION public.fetch_item(p_id uuid);
DROP FUNCTION public.fetch_items(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

create type "public"."item_type" as enum ('potion', 'ring', 'rod', 'scroll', 'staff', 'wand', 'other');

drop type "public"."item_row";

alter table "public"."items" add column "type" public.item_type not null default 'other'::public.item_type;

create type "public"."item_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "type" public.item_type, "notes" jsonb);

CREATE OR REPLACE FUNCTION public.create_item(p_campaign_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.items%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.items, p_item);
  v_id := public.create_equipment(
    p_campaign_id,
    p_lang,
    p_item || jsonb_build_object('kind', 'item'::public.resource_kind),
    p_item_translation
  );

  INSERT INTO public.items (resource_id, type)
  VALUES (v_id, r.type);

  perform public.upsert_item_translation(v_id, p_lang, p_item_translation);

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_item(p_id uuid)
 RETURNS public.item_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    e.campaign_id,
    e.campaign_name,
    e.id,
    e.kind,
    e.visibility,
    e.name,
    e.page,
    e.cost,
    e.magic,
    e.rarity,
    e.weight,
    i.type,
    e.notes
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.items i ON i.resource_id = e.id
  WHERE e.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_items(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.item_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH base AS (
  SELECT e.*
  FROM public.fetch_equipments(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS e
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
    b.cost,
    b.magic,
    b.rarity,
    b.weight,
    i.type,
    b.notes
  FROM base b
  JOIN public.items i ON i.resource_id = b.id
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.page,
  s.cost,
  s.magic,
  s.rarity,
  s.weight,
  s.type,
  s.notes
FROM src s
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$function$
;

CREATE OR REPLACE FUNCTION public.update_item(p_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
    type
  ) = (
    SELECT r.type
    FROM jsonb_populate_record(null::public.items, to_jsonb(i) || p_item) AS r
  )
  WHERE i.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_item_translation(p_id, p_lang, p_item_translation);
END;
$function$
;


