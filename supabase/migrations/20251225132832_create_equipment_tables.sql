
  create table "public"."equipment_translations" (
    "resource_id" uuid not null,
    "lang" text not null,
    "notes" text
      );


alter table "public"."equipment_translations" enable row level security;


  create table "public"."equipments" (
    "resource_id" uuid not null,
    "cost" integer not null default 0,
    "magic" boolean not null default false,
    "weight" integer not null default 0
      );


alter table "public"."equipments" enable row level security;

alter table "public"."spells" alter column "resource_id" drop default;

CREATE UNIQUE INDEX equipment_translations_pkey ON public.equipment_translations USING btree (resource_id, lang);

CREATE UNIQUE INDEX equipments_pkey ON public.equipments USING btree (resource_id);

alter table "public"."equipment_translations" add constraint "equipment_translations_pkey" PRIMARY KEY using index "equipment_translations_pkey";

alter table "public"."equipments" add constraint "equipments_pkey" PRIMARY KEY using index "equipments_pkey";

alter table "public"."equipment_translations" add constraint "equipment_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."equipment_translations" validate constraint "equipment_translations_lang_fkey";

alter table "public"."equipment_translations" add constraint "equipment_translations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."equipment_translations" validate constraint "equipment_translations_resource_id_fkey";

alter table "public"."equipments" add constraint "equipments_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."equipments" validate constraint "equipments_resource_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_equipment(p_campaign_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.equipments%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipments, p_equipment);

  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_equipment || jsonb_build_object('kind', 'equipment'::public.resource_kind),
    p_equipment_translation
  );

  INSERT INTO public.equipments (
    resource_id, cost, magic, weight
  ) VALUES (
    v_id, r.cost, r.magic, r.weight
  );

  perform public.upsert_equipment_translation(v_id, p_lang, p_equipment_translation);

  RETURN v_id;
END;
$function$
;

create type "public"."equipment_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "weight" integer, "notes" jsonb);

CREATE OR REPLACE FUNCTION public.fetch_equipment(p_id uuid)
 RETURNS public.equipment_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.equipment_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'equipment'::public.resource_kind
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
    e.weight
  FROM base b
  JOIN public.equipments e ON e.resource_id = b.id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.notes) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS notes
  FROM src s
  LEFT JOIN public.equipment_translations t ON t.resource_id = s.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY s.id
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
  s.weight,
  coalesce(tt.notes, '{}'::jsonb) AS notes
FROM src s
LEFT JOIN t tt ON tt.id = s.id
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

CREATE OR REPLACE FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_rows int;
BEGIN
  perform public.update_resource(
    p_id,
    p_lang,
    p_equipment || jsonb_build_object('kind', 'equipment'::public.resource_kind),
    p_equipment_translation
  );

  UPDATE public.equipments e
  SET (
    cost, magic, weight
  ) = (
    SELECT r.cost, r.magic, r.weight
    FROM jsonb_populate_record(null::public.equipments, to_jsonb(e) || p_equipment) AS r
  )
  WHERE e.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_equipment_translation(p_id, p_lang, p_equipment_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_equipment_translation(p_id uuid, p_lang text, p_equipment_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_equipment_resource_kind()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'equipment'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not an equipment', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."equipment_translations" to "anon";

grant insert on table "public"."equipment_translations" to "anon";

grant references on table "public"."equipment_translations" to "anon";

grant select on table "public"."equipment_translations" to "anon";

grant trigger on table "public"."equipment_translations" to "anon";

grant truncate on table "public"."equipment_translations" to "anon";

grant update on table "public"."equipment_translations" to "anon";

grant delete on table "public"."equipment_translations" to "authenticated";

grant insert on table "public"."equipment_translations" to "authenticated";

grant references on table "public"."equipment_translations" to "authenticated";

grant select on table "public"."equipment_translations" to "authenticated";

grant trigger on table "public"."equipment_translations" to "authenticated";

grant truncate on table "public"."equipment_translations" to "authenticated";

grant update on table "public"."equipment_translations" to "authenticated";

grant delete on table "public"."equipment_translations" to "service_role";

grant insert on table "public"."equipment_translations" to "service_role";

grant references on table "public"."equipment_translations" to "service_role";

grant select on table "public"."equipment_translations" to "service_role";

grant trigger on table "public"."equipment_translations" to "service_role";

grant truncate on table "public"."equipment_translations" to "service_role";

grant update on table "public"."equipment_translations" to "service_role";

grant delete on table "public"."equipments" to "anon";

grant insert on table "public"."equipments" to "anon";

grant references on table "public"."equipments" to "anon";

grant select on table "public"."equipments" to "anon";

grant trigger on table "public"."equipments" to "anon";

grant truncate on table "public"."equipments" to "anon";

grant update on table "public"."equipments" to "anon";

grant delete on table "public"."equipments" to "authenticated";

grant insert on table "public"."equipments" to "authenticated";

grant references on table "public"."equipments" to "authenticated";

grant select on table "public"."equipments" to "authenticated";

grant trigger on table "public"."equipments" to "authenticated";

grant truncate on table "public"."equipments" to "authenticated";

grant update on table "public"."equipments" to "authenticated";

grant delete on table "public"."equipments" to "service_role";

grant insert on table "public"."equipments" to "service_role";

grant references on table "public"."equipments" to "service_role";

grant select on table "public"."equipments" to "service_role";

grant trigger on table "public"."equipments" to "service_role";

grant truncate on table "public"."equipments" to "service_role";

grant update on table "public"."equipments" to "service_role";


  create policy "Creators and GMs can create new equipment translations"
  on "public"."equipment_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete equipment translations"
  on "public"."equipment_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update equipment translations"
  on "public"."equipment_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read equipment translations"
  on "public"."equipment_translations"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id)));



  create policy "Creators and GMs can create new equipments"
  on "public"."equipments"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete equipments"
  on "public"."equipments"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update equipments"
  on "public"."equipments"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read equipments"
  on "public"."equipments"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id)));


CREATE TRIGGER enforce_equipment_resource_kind BEFORE INSERT OR UPDATE ON public.equipments FOR EACH ROW EXECUTE FUNCTION public.validate_equipment_resource_kind();


-- Equipment (base)
INSERT INTO public.equipments (resource_id, cost, magic, weight)
SELECT a.id, a.cost, 'false'::boolean, a.weight
FROM public.armors a;

INSERT INTO public.equipments (resource_id, cost, magic, weight)
SELECT w.id, w.cost, w.magic, w.weight
FROM public.weapons w;

-- Equipment translations (notes)
INSERT INTO public.equipment_translations (resource_id, lang, notes)
SELECT at.armor_id, at.lang, at.notes
FROM public.armor_translations at;

INSERT INTO public.equipment_translations (resource_id, lang, notes)
SELECT wt.weapon_id, wt.lang, wt.notes
FROM public.weapon_translations wt;
