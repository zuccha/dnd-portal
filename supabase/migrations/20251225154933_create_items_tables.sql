
  create table "public"."item_translations" (
    "resource_id" uuid not null,
    "lang" text not null
      );


alter table "public"."item_translations" enable row level security;


  create table "public"."items" (
    "resource_id" uuid not null
      );


alter table "public"."items" enable row level security;

alter table "public"."weapon_translations" alter column "resource_id" drop default;

alter table "public"."weapons" alter column "resource_id" drop default;

CREATE UNIQUE INDEX item_translations_pkey ON public.item_translations USING btree (resource_id, lang);

CREATE UNIQUE INDEX items_pkey ON public.items USING btree (resource_id);

alter table "public"."item_translations" add constraint "item_translations_pkey" PRIMARY KEY using index "item_translations_pkey";

alter table "public"."items" add constraint "items_pkey" PRIMARY KEY using index "items_pkey";

alter table "public"."item_translations" add constraint "item_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."item_translations" validate constraint "item_translations_lang_fkey";

alter table "public"."item_translations" add constraint "item_translations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.items(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."item_translations" validate constraint "item_translations_resource_id_fkey";

alter table "public"."items" add constraint "items_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."items" validate constraint "items_resource_id_fkey";

create type "public"."item_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "weight" integer, "notes" jsonb);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_item(p_campaign_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
BEGIN
  v_id := public.create_equipment(
    p_campaign_id,
    p_lang,
    p_item,
    p_item_translation
  );

  INSERT INTO public.items (resource_id)
  VALUES (v_id);

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
    e.weight,
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
    b.weight,
    b.notes
  FROM base b
  JOIN public.items i ON i.resource_id = b.id
),
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
  s.weight,
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
    p_item,
    p_item_translation
  );

  UPDATE public.items i
  SET resource_id = i.resource_id
  WHERE i.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_item_translation(p_id, p_lang, p_item_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_item_translation(p_id uuid, p_lang text, p_item_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
BEGIN
  INSERT INTO public.item_translations AS it (resource_id, lang)
  VALUES (p_id, p_lang)
  ON conflict (resource_id, lang) DO NOTHING;

  perform public.upsert_resource_translation(p_id, p_lang, p_item_translation);
  perform public.upsert_equipment_translation(p_id, p_lang, p_item_translation);
END;
$function$
;

grant delete on table "public"."item_translations" to "anon";

grant insert on table "public"."item_translations" to "anon";

grant references on table "public"."item_translations" to "anon";

grant select on table "public"."item_translations" to "anon";

grant trigger on table "public"."item_translations" to "anon";

grant truncate on table "public"."item_translations" to "anon";

grant update on table "public"."item_translations" to "anon";

grant delete on table "public"."item_translations" to "authenticated";

grant insert on table "public"."item_translations" to "authenticated";

grant references on table "public"."item_translations" to "authenticated";

grant select on table "public"."item_translations" to "authenticated";

grant trigger on table "public"."item_translations" to "authenticated";

grant truncate on table "public"."item_translations" to "authenticated";

grant update on table "public"."item_translations" to "authenticated";

grant delete on table "public"."item_translations" to "service_role";

grant insert on table "public"."item_translations" to "service_role";

grant references on table "public"."item_translations" to "service_role";

grant select on table "public"."item_translations" to "service_role";

grant trigger on table "public"."item_translations" to "service_role";

grant truncate on table "public"."item_translations" to "service_role";

grant update on table "public"."item_translations" to "service_role";

grant delete on table "public"."items" to "anon";

grant insert on table "public"."items" to "anon";

grant references on table "public"."items" to "anon";

grant select on table "public"."items" to "anon";

grant trigger on table "public"."items" to "anon";

grant truncate on table "public"."items" to "anon";

grant update on table "public"."items" to "anon";

grant delete on table "public"."items" to "authenticated";

grant insert on table "public"."items" to "authenticated";

grant references on table "public"."items" to "authenticated";

grant select on table "public"."items" to "authenticated";

grant trigger on table "public"."items" to "authenticated";

grant truncate on table "public"."items" to "authenticated";

grant update on table "public"."items" to "authenticated";

grant delete on table "public"."items" to "service_role";

grant insert on table "public"."items" to "service_role";

grant references on table "public"."items" to "service_role";

grant select on table "public"."items" to "service_role";

grant trigger on table "public"."items" to "service_role";

grant truncate on table "public"."items" to "service_role";

grant update on table "public"."items" to "service_role";


  create policy "Creators and GMs can create new item translations"
  on "public"."item_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete item translations"
  on "public"."item_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update item translations"
  on "public"."item_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read item translations"
  on "public"."item_translations"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id)));



  create policy "Creators and GMs can create new items"
  on "public"."items"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete items"
  on "public"."items"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update items"
  on "public"."items"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read items"
  on "public"."items"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id)));



