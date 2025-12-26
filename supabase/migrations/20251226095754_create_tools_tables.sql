create type "public"."tool_type" as enum ('artisan', 'other');


  create table "public"."tool_translations" (
    "resource_id" uuid not null,
    "lang" text not null,
    "craft" text not null,
    "utilize" text not null
      );


alter table "public"."tool_translations" enable row level security;


  create table "public"."tools" (
    "resource_id" uuid not null,
    "ability" public.creature_ability not null,
    "type" public.tool_type not null
      );


alter table "public"."tools" enable row level security;

CREATE UNIQUE INDEX tool_translations_pkey ON public.tool_translations USING btree (resource_id, lang);

CREATE UNIQUE INDEX tools_pkey ON public.tools USING btree (resource_id);

alter table "public"."tool_translations" add constraint "tool_translations_pkey" PRIMARY KEY using index "tool_translations_pkey";

alter table "public"."tools" add constraint "tools_pkey" PRIMARY KEY using index "tools_pkey";

alter table "public"."tool_translations" add constraint "tool_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tool_translations" validate constraint "tool_translations_lang_fkey";

alter table "public"."tool_translations" add constraint "tool_translations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.tools(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tool_translations" validate constraint "tool_translations_resource_id_fkey";

alter table "public"."tools" add constraint "tools_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."tools" validate constraint "tools_resource_id_fkey";

create type "public"."tool_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "weight" integer, "notes" jsonb, "ability" public.creature_ability, "type" public.tool_type, "craft" jsonb, "utilize" jsonb);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_tool(p_campaign_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.tools%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.tools, p_tool);

  v_id := public.create_equipment(
    p_campaign_id,
    p_lang,
    p_tool,
    p_tool_translation
  );

  INSERT INTO public.tools (
    resource_id, type, ability
  ) VALUES (
    v_id, r.type, r.ability
  );

  perform public.upsert_tool_translation(v_id, p_lang, p_tool_translation);

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_tool(p_id uuid)
 RETURNS public.tool_row
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
    e.notes,
    t.ability,
    t.type,
    coalesce(tt.craft, '{}'::jsonb) AS craft,
    coalesce(tt.utilize, '{}'::jsonb) AS utilize
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.tools t ON t.resource_id = e.id
  LEFT JOIN (
    SELECT
      t.resource_id AS id,
      jsonb_object_agg(tt.lang, tt.craft) AS craft,
      jsonb_object_agg(tt.lang, tt.utilize) AS utilize
    FROM public.tools t
    LEFT JOIN public.tool_translations tt ON tt.resource_id = t.resource_id
    WHERE t.resource_id = p_id
    GROUP BY t.resource_id
  ) tt ON tt.id = e.id
  WHERE e.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_tools(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.tool_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
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
    jsonb_object_agg(t.lang, t.craft) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS craft,
    jsonb_object_agg(t.lang, t.utilize) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS utilize
  FROM filtered f
  LEFT JOIN public.tool_translations t ON t.resource_id = f.id
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
  f.weight,
  f.notes,
  f.ability,
  f.type,
  coalesce(tt.craft, '{}'::jsonb) AS craft,
  coalesce(tt.utilize, '{}'::jsonb) AS utilize
FROM filtered f
LEFT JOIN tt ON tt.id = f.id
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

CREATE OR REPLACE FUNCTION public.update_tool(p_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb)
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
    p_tool,
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

  perform public.upsert_tool_translation(p_id, p_lang, p_tool_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_tool_translation(p_id uuid, p_lang text, p_tool_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  r public.tool_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.tool_translations, p_tool_translation);

  INSERT INTO public.tool_translations AS tt (
    resource_id, lang, utilize, craft
  ) VALUES (
    p_id, p_lang, r.utilize, r.craft
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    utilize = excluded.utilize,
    craft = excluded.craft;

  perform public.upsert_resource_translation(p_id, p_lang, p_tool_translation);
  perform public.upsert_equipment_translation(p_id, p_lang, p_tool_translation);
END;
$function$
;

grant delete on table "public"."tool_translations" to "anon";

grant insert on table "public"."tool_translations" to "anon";

grant references on table "public"."tool_translations" to "anon";

grant select on table "public"."tool_translations" to "anon";

grant trigger on table "public"."tool_translations" to "anon";

grant truncate on table "public"."tool_translations" to "anon";

grant update on table "public"."tool_translations" to "anon";

grant delete on table "public"."tool_translations" to "authenticated";

grant insert on table "public"."tool_translations" to "authenticated";

grant references on table "public"."tool_translations" to "authenticated";

grant select on table "public"."tool_translations" to "authenticated";

grant trigger on table "public"."tool_translations" to "authenticated";

grant truncate on table "public"."tool_translations" to "authenticated";

grant update on table "public"."tool_translations" to "authenticated";

grant delete on table "public"."tool_translations" to "service_role";

grant insert on table "public"."tool_translations" to "service_role";

grant references on table "public"."tool_translations" to "service_role";

grant select on table "public"."tool_translations" to "service_role";

grant trigger on table "public"."tool_translations" to "service_role";

grant truncate on table "public"."tool_translations" to "service_role";

grant update on table "public"."tool_translations" to "service_role";

grant delete on table "public"."tools" to "anon";

grant insert on table "public"."tools" to "anon";

grant references on table "public"."tools" to "anon";

grant select on table "public"."tools" to "anon";

grant trigger on table "public"."tools" to "anon";

grant truncate on table "public"."tools" to "anon";

grant update on table "public"."tools" to "anon";

grant delete on table "public"."tools" to "authenticated";

grant insert on table "public"."tools" to "authenticated";

grant references on table "public"."tools" to "authenticated";

grant select on table "public"."tools" to "authenticated";

grant trigger on table "public"."tools" to "authenticated";

grant truncate on table "public"."tools" to "authenticated";

grant update on table "public"."tools" to "authenticated";

grant delete on table "public"."tools" to "service_role";

grant insert on table "public"."tools" to "service_role";

grant references on table "public"."tools" to "service_role";

grant select on table "public"."tools" to "service_role";

grant trigger on table "public"."tools" to "service_role";

grant truncate on table "public"."tools" to "service_role";

grant update on table "public"."tools" to "service_role";


  create policy "Creators and GMs can create new tool translations"
  on "public"."tool_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete tool translations"
  on "public"."tool_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update tool translations"
  on "public"."tool_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read tool translations"
  on "public"."tool_translations"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id)));



  create policy "Creators and GMs can create new tools"
  on "public"."tools"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete tools"
  on "public"."tools"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update tools"
  on "public"."tools"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read tools"
  on "public"."tools"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id)));



