drop policy "Creators and GMs can create new armor translations" on "public"."armor_translations";

drop policy "Creators and GMs can delete armor translations" on "public"."armor_translations";

drop policy "Creators and GMs can update armor translations" on "public"."armor_translations";

drop policy "Users can read armor translations" on "public"."armor_translations";

drop policy "Creators and GMs can create new armors" on "public"."armors";

drop policy "Creators and GMs can delete armors" on "public"."armors";

drop policy "Creators and GMs can update armors" on "public"."armors";

drop policy "Users can read armors" on "public"."armors";

alter table "public"."armor_translations" drop constraint "armor_translations_armor_id_fkey";

alter table "public"."armors" drop constraint "armors_campaign_id_fkey";

drop function if exists "public"."can_edit_armor_translation"(p_armor_id uuid);

drop function if exists "public"."can_read_armor_translation"(p_armor_id uuid);

drop function if exists "public"."fetch_armors"(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text);

alter table "public"."armor_translations" drop constraint "armor_translations_pkey";

alter table "public"."armors" drop constraint "armors_pkey";

drop index if exists "public"."armor_translations_pkey";

drop index if exists "public"."armors_pkey";

alter table "public"."armor_translations" rename column "armor_id" to "resource_id";

alter table "public"."armor_translations" drop column "name";

alter table "public"."armor_translations" drop column "notes";

alter table "public"."armor_translations" drop column "page";

alter table "public"."armors" drop column "campaign_id";

alter table "public"."armors" drop column "cost";

alter table "public"."armors" drop column "created_at";

alter table "public"."armors" rename column "id" to "resource_id";

alter table "public"."armors" drop column "visibility";

alter table "public"."armors" drop column "weight";

CREATE UNIQUE INDEX armor_translations_pkey ON public.armor_translations USING btree (resource_id, lang);

CREATE UNIQUE INDEX armors_pkey ON public.armors USING btree (resource_id);

alter table "public"."armor_translations" add constraint "armor_translations_pkey" PRIMARY KEY using index "armor_translations_pkey";

alter table "public"."armors" add constraint "armors_pkey" PRIMARY KEY using index "armors_pkey";

alter table "public"."armor_translations" add constraint "armor_translations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.armors(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."armor_translations" validate constraint "armor_translations_resource_id_fkey";

alter table "public"."armors" add constraint "armors_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."armors" validate constraint "armors_resource_id_fkey";

set check_function_bodies = off;

create type "public"."armor_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "cost" integer, "magic" boolean, "weight" integer, "armor_class_max_cha_modifier" smallint, "armor_class_max_con_modifier" smallint, "armor_class_max_dex_modifier" smallint, "armor_class_max_int_modifier" smallint, "armor_class_max_str_modifier" smallint, "armor_class_max_wis_modifier" smallint, "armor_class_modifier" smallint, "base_armor_class" smallint, "disadvantage_on_stealth" boolean, "required_cha" smallint, "required_con" smallint, "required_dex" smallint, "required_int" smallint, "required_str" smallint, "required_wis" smallint, "type" public.armor_type, "notes" jsonb);

CREATE OR REPLACE FUNCTION public.create_armor(p_campaign_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.armors%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.armors, p_armor);

  v_id := public.create_equipment(
    p_campaign_id,
    p_lang,
    p_armor,
    p_armor_translation
  );

  INSERT INTO public.armors (
    resource_id,
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type
  ) VALUES (
    v_id,
    r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
    r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
    r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
    r.armor_class_modifier, r.base_armor_class,
    r.disadvantage_on_stealth,
    r.required_cha, r.required_con, r.required_dex,
    r.required_int, r.required_str, r.required_wis,
    r.type
  );

  perform public.upsert_armor_translation(v_id, p_lang, p_armor_translation);

  RETURN v_id;
END;
$function$
;

drop function if exists public.fetch_armor(p_id uuid);
CREATE OR REPLACE FUNCTION public.fetch_armor(p_id uuid)
 RETURNS public.armor_row
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
    a.armor_class_max_cha_modifier,
    a.armor_class_max_con_modifier,
    a.armor_class_max_dex_modifier,
    a.armor_class_max_int_modifier,
    a.armor_class_max_str_modifier,
    a.armor_class_max_wis_modifier,
    a.armor_class_modifier,
    a.base_armor_class,
    a.disadvantage_on_stealth,
    a.required_cha,
    a.required_con,
    a.required_dex,
    a.required_int,
    a.required_str,
    a.required_wis,
    a.type,
    e.notes
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.armors a ON a.resource_id = e.id
  WHERE e.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_armors(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.armor_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT
    -- campaign/modules include/exclude filter (keys are campaign or module ids)
    coalesce(p_filters->'campaigns', '{}'::jsonb) AS campaign_filter,

    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.armor_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.armor_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc
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
    b.notes,
    a.armor_class_max_cha_modifier,
    a.armor_class_max_con_modifier,
    a.armor_class_max_dex_modifier,
    a.armor_class_max_int_modifier,
    a.armor_class_max_str_modifier,
    a.armor_class_max_wis_modifier,
    a.armor_class_modifier,
    a.base_armor_class,
    a.disadvantage_on_stealth,
    a.required_cha,
    a.required_con,
    a.required_dex,
    a.required_int,
    a.required_str,
    a.required_wis,
    a.type,
    e.cost,
    e.magic,
    e.weight
  FROM base b
  JOIN public.armors a ON a.resource_id = b.id
  JOIN public.equipments e ON e.resource_id = b.id
  JOIN prefs p ON true
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    -- types
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
)
SELECT
  f.campaign_id,
  f.campaign_name,
  f.id,
  f.kind,
  f.visibility,
  f.name                          AS name,
  f.page                          AS page,
  f.cost,
  f.magic,
  f.weight,
  f.armor_class_max_cha_modifier,
  f.armor_class_max_con_modifier,
  f.armor_class_max_dex_modifier,
  f.armor_class_max_int_modifier,
  f.armor_class_max_str_modifier,
  f.armor_class_max_wis_modifier,
  f.armor_class_modifier,
  f.base_armor_class,
  f.disadvantage_on_stealth,
  f.required_cha,
  f.required_con,
  f.required_dex,
  f.required_int,
  f.required_str,
  f.required_wis,
  f.type,
  f.notes                         AS notes
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
$function$
;

CREATE OR REPLACE FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb)
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
    p_armor,
    p_armor_translation
  );

  UPDATE public.armors s
  SET (
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type
  ) = (
    SELECT r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
      r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
      r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
      r.armor_class_modifier, r.base_armor_class,
      r.disadvantage_on_stealth,
      r.required_cha, r.required_con, r.required_dex,
      r.required_int, r.required_str, r.required_wis,
      r.type
    FROM jsonb_populate_record(null::public.armors, to_jsonb(s) || p_armor) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_armor_translation(p_id, p_lang, p_armor_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_armor_translation(p_id uuid, p_lang text, p_armor_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.armor_translations AS at (resource_id, lang)
  VALUES (p_id, p_lang)
  ON conflict (resource_id, lang) DO NOTHING;

  perform public.upsert_resource_translation(p_id, p_lang, p_armor_translation);
  perform public.upsert_equipment_translation(p_id, p_lang, p_armor_translation);
END;
$function$
;


  create policy "Creators and GMs can create new armor translations"
  on "public"."armor_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete armor translations"
  on "public"."armor_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update armor translations"
  on "public"."armor_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read armor translations"
  on "public"."armor_translations"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id)));



  create policy "Creators and GMs can create new armors"
  on "public"."armors"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete armors"
  on "public"."armors"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update armors"
  on "public"."armors"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read armors"
  on "public"."armors"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id)));



