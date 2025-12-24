create type "public"."armor_type" as enum ('heavy', 'light', 'medium', 'shield');


  create table "public"."armor_translations" (
    "armor_id" uuid not null default gen_random_uuid(),
    "lang" text not null,
    "name" text not null default ''::text,
    "page" smallint,
    "notes" text
      );


alter table "public"."armor_translations" enable row level security;


  create table "public"."armors" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "campaign_id" uuid not null default gen_random_uuid(),
    "visibility" public.campaign_role not null default 'player'::public.campaign_role,
    "armor_class_max_cha_modifier" smallint default 0,
    "armor_class_max_con_modifier" smallint default 0,
    "armor_class_max_dex_modifier" smallint default 0,
    "armor_class_max_int_modifier" smallint default 0,
    "armor_class_max_str_modifier" smallint default 0,
    "armor_class_max_wis_modifier" smallint default 0,
    "armor_class_modifier" smallint default 0,
    "base_armor_class" smallint not null default 0,
    "cost" integer not null default 0,
    "disadvantage_on_stealth" boolean not null default false,
    "required_cha" smallint not null default 0,
    "required_con" smallint not null default 0,
    "required_dex" smallint not null default 0,
    "required_int" smallint not null default 0,
    "required_str" smallint not null default 0,
    "required_wis" smallint not null default 0,
    "type" public.armor_type not null,
    "weight" integer not null default 0
      );


alter table "public"."armors" enable row level security;

CREATE UNIQUE INDEX armor_translations_pkey ON public.armor_translations USING btree (armor_id, lang);

CREATE UNIQUE INDEX armors_pkey ON public.armors USING btree (id);

alter table "public"."armor_translations" add constraint "armor_translations_pkey" PRIMARY KEY using index "armor_translations_pkey";

alter table "public"."armors" add constraint "armors_pkey" PRIMARY KEY using index "armors_pkey";

alter table "public"."armor_translations" add constraint "armor_translations_armor_id_fkey" FOREIGN KEY (armor_id) REFERENCES public.armors(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."armor_translations" validate constraint "armor_translations_armor_id_fkey";

alter table "public"."armor_translations" add constraint "armor_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."armor_translations" validate constraint "armor_translations_lang_fkey";

alter table "public"."armors" add constraint "armors_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."armors" validate constraint "armors_campaign_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_edit_armor_translation(p_armor_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT can_edit_campaign_resource(a.campaign_id)
  FROM public.armors a
  WHERE a.id = p_armor_id;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_armor_translation(p_armor_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT can_read_campaign_resource(a.campaign_id, a.visibility)
  FROM public.armors a
  WHERE a.id = p_armor_id;
$function$
;

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

  INSERT INTO public.armors (
    campaign_id, visibility,
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    cost, disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type, weight
  ) VALUES (
    p_campaign_id, r.visibility,
    r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
    r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
    r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
    r.armor_class_modifier, r.base_armor_class,
    r.cost, r.disadvantage_on_stealth,
    r.required_cha, r.required_con, r.required_dex,
    r.required_int, r.required_str, r.required_wis,
    r.type, r.weight
  )
  RETURNING id INTO v_id;

  perform public.upsert_armor_translation(v_id, p_lang, p_armor_translation);

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_armor(p_id uuid)
 RETURNS record
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    a.id,
    a.campaign_id,
    c.name                          AS campaign_name,
    a.visibility,
    a.armor_class_max_cha_modifier,
    a.armor_class_max_con_modifier,
    a.armor_class_max_dex_modifier,
    a.armor_class_max_int_modifier,
    a.armor_class_max_str_modifier,
    a.armor_class_max_wis_modifier,
    a.armor_class_modifier,
    a.base_armor_class,
    a.cost,
    a.disadvantage_on_stealth,
    a.required_cha,
    a.required_con,
    a.required_dex,
    a.required_int,
    a.required_str,
    a.required_wis,
    a.type,
    a.weight,
    coalesce(tt.name,  '{}'::jsonb) AS name,
    coalesce(tt.notes, '{}'::jsonb) AS notes,
    coalesce(tt.page,  '{}'::jsonb) AS page
  FROM public.armors a
  JOIN public.campaigns c ON c.id = a.campaign_id
  LEFT JOIN (
    SELECT
      a.id,
      jsonb_object_agg(t.lang, t.name)  AS name,
      jsonb_object_agg(t.lang, t.notes) AS notes,
      jsonb_object_agg(t.lang, t.page)  AS page
    FROM public.armors a
    LEFT JOIN public.armor_translations t ON t.armor_id = a.id
    WHERE a.id = p_id
    GROUP BY a.id
  ) tt ON tt.id = a.id
  WHERE a.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_armors(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, visibility public.campaign_role, armor_class_max_cha_modifier smallint, armor_class_max_con_modifier smallint, armor_class_max_dex_modifier smallint, armor_class_max_int_modifier smallint, armor_class_max_str_modifier smallint, armor_class_max_wis_modifier smallint, armor_class_modifier smallint, base_armor_class smallint, cost integer, disadvantage_on_stealth boolean, required_cha smallint, required_con smallint, required_dex smallint, required_int smallint, required_str smallint, required_wis smallint, type public.armor_type, weight integer, name jsonb, notes jsonb, page jsonb)
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
src AS (
  SELECT a.*
  FROM public.armors a
  JOIN prefs p ON true
  JOIN public.campaign_resource_ids(p_campaign_id, p.campaign_filter) ci ON ci.id = a.campaign_id
  JOIN public.campaigns c ON c.id = a.campaign_id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
    -- types
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                AS name,
    jsonb_object_agg(t.lang, t.notes)       FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS notes,
    jsonb_object_agg(t.lang, t.page)        FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS page
  FROM filtered f
  LEFT JOIN public.armor_translations t ON t.armor_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  c.name                          AS campaign_name,
  f.visibility,
  f.armor_class_max_cha_modifier,
  f.armor_class_max_con_modifier,
  f.armor_class_max_dex_modifier,
  f.armor_class_max_int_modifier,
  f.armor_class_max_str_modifier,
  f.armor_class_max_wis_modifier,
  f.armor_class_modifier,
  f.base_armor_class,
  f.cost,
  f.disadvantage_on_stealth,
  f.required_cha,
  f.required_con,
  f.required_dex,
  f.required_int,
  f.required_str,
  f.required_wis,
  f.type,
  f.weight,
  coalesce(tt.name,  '{}'::jsonb) AS name,
  coalesce(tt.notes, '{}'::jsonb) AS notes,
  coalesce(tt.page,  '{}'::jsonb) AS page
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

CREATE OR REPLACE FUNCTION public.update_armor(p_id uuid, p_lang text, p_armor jsonb, p_armor_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.armors s
  SET (
    visibility,
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    cost, disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type, weight
  ) = (
    SELECT r.visibility,
      r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
      r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
      r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
      r.armor_class_modifier, r.base_armor_class,
      r.cost, r.disadvantage_on_stealth,
      r.required_cha, r.required_con, r.required_dex,
      r.required_int, r.required_str, r.required_wis,
      r.type, r.weight
    FROM jsonb_populate_record(null::public.armors, to_jsonb(s) || p_armor) AS r
  )
  WHERE s.id = p_id;

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
DECLARE
  r public.armor_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.armor_translations, p_armor_translation);

  INSERT INTO public.armor_translations AS st (
    armor_id, lang, name, page, notes
  ) VALUES (
    p_id, p_lang, r.name, r.page, r.notes
  )
  ON conflict (armor_id, lang) DO UPDATE
  SET
    name = excluded.name,
    page = excluded.page,
    notes = excluded.notes;
END;
$function$
;

grant delete on table "public"."armor_translations" to "anon";

grant insert on table "public"."armor_translations" to "anon";

grant references on table "public"."armor_translations" to "anon";

grant select on table "public"."armor_translations" to "anon";

grant trigger on table "public"."armor_translations" to "anon";

grant truncate on table "public"."armor_translations" to "anon";

grant update on table "public"."armor_translations" to "anon";

grant delete on table "public"."armor_translations" to "authenticated";

grant insert on table "public"."armor_translations" to "authenticated";

grant references on table "public"."armor_translations" to "authenticated";

grant select on table "public"."armor_translations" to "authenticated";

grant trigger on table "public"."armor_translations" to "authenticated";

grant truncate on table "public"."armor_translations" to "authenticated";

grant update on table "public"."armor_translations" to "authenticated";

grant delete on table "public"."armor_translations" to "service_role";

grant insert on table "public"."armor_translations" to "service_role";

grant references on table "public"."armor_translations" to "service_role";

grant select on table "public"."armor_translations" to "service_role";

grant trigger on table "public"."armor_translations" to "service_role";

grant truncate on table "public"."armor_translations" to "service_role";

grant update on table "public"."armor_translations" to "service_role";

grant delete on table "public"."armors" to "anon";

grant insert on table "public"."armors" to "anon";

grant references on table "public"."armors" to "anon";

grant select on table "public"."armors" to "anon";

grant trigger on table "public"."armors" to "anon";

grant truncate on table "public"."armors" to "anon";

grant update on table "public"."armors" to "anon";

grant delete on table "public"."armors" to "authenticated";

grant insert on table "public"."armors" to "authenticated";

grant references on table "public"."armors" to "authenticated";

grant select on table "public"."armors" to "authenticated";

grant trigger on table "public"."armors" to "authenticated";

grant truncate on table "public"."armors" to "authenticated";

grant update on table "public"."armors" to "authenticated";

grant delete on table "public"."armors" to "service_role";

grant insert on table "public"."armors" to "service_role";

grant references on table "public"."armors" to "service_role";

grant select on table "public"."armors" to "service_role";

grant trigger on table "public"."armors" to "service_role";

grant truncate on table "public"."armors" to "service_role";

grant update on table "public"."armors" to "service_role";


  create policy "Creators and GMs can create new armor translations"
  on "public"."armor_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_armor_translation(armor_id));



  create policy "Creators and GMs can delete armor translations"
  on "public"."armor_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_armor_translation(armor_id));



  create policy "Creators and GMs can update armor translations"
  on "public"."armor_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_armor_translation(armor_id))
with check (public.can_edit_armor_translation(armor_id));



  create policy "Users can read armor translations"
  on "public"."armor_translations"
  as permissive
  for select
  to authenticated
using ((public.can_read_armor_translation(armor_id) OR public.can_edit_armor_translation(armor_id)));



  create policy "Creators and GMs can create new armors"
  on "public"."armors"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_campaign_resource(campaign_id));



  create policy "Creators and GMs can delete armors"
  on "public"."armors"
  as permissive
  for delete
  to authenticated
using (public.can_edit_campaign_resource(campaign_id));



  create policy "Creators and GMs can update armors"
  on "public"."armors"
  as permissive
  for update
  to authenticated
using (public.can_edit_campaign_resource(campaign_id))
with check (public.can_edit_campaign_resource(campaign_id));



  create policy "Users can read armors"
  on "public"."armors"
  as permissive
  for select
  to authenticated
using ((public.can_read_campaign_resource(campaign_id, visibility) OR public.can_edit_campaign_resource(campaign_id)));



