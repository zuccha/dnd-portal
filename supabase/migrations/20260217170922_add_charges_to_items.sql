DROP FUNCTION public.fetch_item(p_id uuid);
DROP FUNCTION public.fetch_items(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

drop type "public"."item_row";

alter table "public"."items" add column "charges" integer;

alter table "public"."items" add column "consumable" boolean not null default false;

alter table "public"."items" add constraint "items_charges_non_negative" CHECK (((charges IS NULL) OR (charges >= 0))) not valid;

alter table "public"."items" validate constraint "items_charges_non_negative";

create type "public"."item_row" as ("source_id" uuid, "source_code" text, "id" uuid, "kind" public.resource_kind, "visibility" public.resource_visibility, "image_url" text, "name" jsonb, "name_short" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "rarity" public.equipment_rarity, "weight" integer, "type" public.item_type, "charges" integer, "consumable" boolean, "notes" jsonb);

CREATE OR REPLACE FUNCTION public.create_item(p_source_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb)
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_item(p_id uuid)
 RETURNS public.item_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    e.source_id,
    e.source_code,
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
    i.type,
    i.charges,
    i.consumable,
    e.notes
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.items i ON i.resource_id = e.id
  WHERE e.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_items(p_source_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.item_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;


