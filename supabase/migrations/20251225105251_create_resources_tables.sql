create type "public"."resource_kind" as enum ('creature', 'eldritch_invocation', 'equipment', 'spell');


  create table "public"."resource_translations" (
    "resource_id" uuid not null default gen_random_uuid(),
    "lang" text not null,
    "name" text not null default ''::text,
    "page" smallint
      );


alter table "public"."resource_translations" enable row level security;


  create table "public"."resources" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "campaign_id" uuid not null,
    "visibility" public.campaign_role not null default 'game_master'::public.campaign_role,
    "kind" public.resource_kind not null
      );


alter table "public"."resources" enable row level security;

CREATE UNIQUE INDEX resource_translations_pkey ON public.resource_translations USING btree (resource_id, lang);

CREATE UNIQUE INDEX resources_pkey ON public.resources USING btree (id);

alter table "public"."resource_translations" add constraint "resource_translations_pkey" PRIMARY KEY using index "resource_translations_pkey";

alter table "public"."resources" add constraint "resources_pkey" PRIMARY KEY using index "resources_pkey";

alter table "public"."resource_translations" add constraint "resource_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."resource_translations" validate constraint "resource_translations_lang_fkey";

alter table "public"."resource_translations" add constraint "resource_translations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."resource_translations" validate constraint "resource_translations_resource_id_fkey";

alter table "public"."resources" add constraint "resources_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."resources" validate constraint "resources_campaign_id_fkey";

create type "public"."resource_row" as ("id" uuid, "campaign_id" uuid, "campaign_name" text, "kind" text, "visibility" public.campaign_role, "name" jsonb, "page" jsonb);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_create_resource(p_campaign_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (
      um.module_id = c.id
      AND um.user_id = (SELECT auth.uid() AS uid)
      AND um.role = 'creator'::public.module_role
    )
    LEFT JOIN public.campaign_players cp ON (
      cp.campaign_id = c.id
      AND cp.user_id = (SELECT auth.uid() AS uid)
      AND cp.role = 'game_master'::public.campaign_role
    )
    WHERE c.id = p_campaign_id
      AND (
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_resource(p_resource_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.resources r
    JOIN public.campaigns c ON c.id = r.campaign_id
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid) AND um.role = 'creator'::public.module_role)
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() as uid) AND cp.role = 'game_master'::public.campaign_role)
    WHERE r.id = p_resource_id
      AND (
        -- Module creators
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        -- Campaign GMs
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_resource(p_resource_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.resources r
    JOIN public.campaigns c ON c.id = r.campaign_id
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid))
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() AS uid))
    WHERE r.id = p_resource_id
      AND (
        (c.is_module = true AND c.visibility = 'public'::public.campaign_visibility)
        OR
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        (c.is_module = false AND cp.user_id IS NOT NULL AND (
          r.visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.create_resource(p_campaign_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.resources%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.resources, p_resource);

  INSERT INTO public.resources (
    campaign_id, visibility, kind
  ) VALUES (
    p_campaign_id, r.visibility, r.kind
  )
  RETURNING id INTO v_id;

  perform public.upsert_resource_translation(v_id, p_lang, p_resource_translation);

  RETURN v_id;
END;
$function$
;

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
    coalesce(tt.page, '{}'::jsonb)  AS page
  FROM public.resources r
  JOIN public.campaigns c ON c.id = r.campaign_id
  LEFT JOIN (
    SELECT
      r.id,
      jsonb_object_agg(t.lang, t.name) AS name,
      jsonb_object_agg(t.lang, t.page) AS page
    FROM public.resources r
    LEFT JOIN public.resource_translations t ON t.resource_id = r.id
    WHERE r.id = p_id
    GROUP BY r.id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
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
      SELECT coalesce(array_agg(lower(e.key)::text), null)
      FROM jsonb_each_text(p_filters->'kinds') AS e(key, value)
      WHERE e.value = 'true'
    ) AS kinds_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::text), null)
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
    (p.kinds_inc IS NULL OR lower(r.kind) = any(p.kinds_inc))
    AND (p.kinds_exc IS NULL OR NOT (lower(r.kind) = any(p.kinds_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS name,
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

CREATE OR REPLACE FUNCTION public.update_resource(p_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.resources r
  SET (
    visibility, kind
  ) = (
    SELECT rr.visibility, rr.kind
    FROM jsonb_populate_record(null::public.resources, to_jsonb(r) || p_resource) AS rr
  )
  WHERE r.id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_resource_translation(p_id, p_lang, p_resource_translation);
END;
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
    resource_id, lang, name, page
  ) VALUES (
    p_id, p_lang, r.name, r.page
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    name = excluded.name,
    page = excluded.page;
END;
$function$
;

grant delete on table "public"."resource_translations" to "anon";

grant insert on table "public"."resource_translations" to "anon";

grant references on table "public"."resource_translations" to "anon";

grant select on table "public"."resource_translations" to "anon";

grant trigger on table "public"."resource_translations" to "anon";

grant truncate on table "public"."resource_translations" to "anon";

grant update on table "public"."resource_translations" to "anon";

grant delete on table "public"."resource_translations" to "authenticated";

grant insert on table "public"."resource_translations" to "authenticated";

grant references on table "public"."resource_translations" to "authenticated";

grant select on table "public"."resource_translations" to "authenticated";

grant trigger on table "public"."resource_translations" to "authenticated";

grant truncate on table "public"."resource_translations" to "authenticated";

grant update on table "public"."resource_translations" to "authenticated";

grant delete on table "public"."resource_translations" to "service_role";

grant insert on table "public"."resource_translations" to "service_role";

grant references on table "public"."resource_translations" to "service_role";

grant select on table "public"."resource_translations" to "service_role";

grant trigger on table "public"."resource_translations" to "service_role";

grant truncate on table "public"."resource_translations" to "service_role";

grant update on table "public"."resource_translations" to "service_role";

grant delete on table "public"."resources" to "anon";

grant insert on table "public"."resources" to "anon";

grant references on table "public"."resources" to "anon";

grant select on table "public"."resources" to "anon";

grant trigger on table "public"."resources" to "anon";

grant truncate on table "public"."resources" to "anon";

grant update on table "public"."resources" to "anon";

grant delete on table "public"."resources" to "authenticated";

grant insert on table "public"."resources" to "authenticated";

grant references on table "public"."resources" to "authenticated";

grant select on table "public"."resources" to "authenticated";

grant trigger on table "public"."resources" to "authenticated";

grant truncate on table "public"."resources" to "authenticated";

grant update on table "public"."resources" to "authenticated";

grant delete on table "public"."resources" to "service_role";

grant insert on table "public"."resources" to "service_role";

grant references on table "public"."resources" to "service_role";

grant select on table "public"."resources" to "service_role";

grant trigger on table "public"."resources" to "service_role";

grant truncate on table "public"."resources" to "service_role";

grant update on table "public"."resources" to "service_role";


  create policy "Creators and GMs can create new resource translations"
  on "public"."resource_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete resource translations"
  on "public"."resource_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update resource translations"
  on "public"."resource_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read resource translations"
  on "public"."resource_translations"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id)));



  create policy "Creators and GMs can create new resources"
  on "public"."resources"
  as permissive
  for insert
  to authenticated
with check (public.can_create_resource(campaign_id));



  create policy "Creators and GMs can delete resources"
  on "public"."resources"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(id));



  create policy "Creators and GMs can update resources"
  on "public"."resources"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(id))
with check (public.can_edit_resource(id));



  create policy "Users can read resources"
  on "public"."resources"
  as permissive
  for select
  to authenticated
using ((public.can_read_resource(id) OR public.can_edit_resource(id)));

-- Resources (base)
INSERT INTO public.resources (id, campaign_id, visibility, kind)
SELECT a.id, a.campaign_id, a.visibility, 'equipment'::public.resource_kind
FROM public.armors a;

INSERT INTO public.resources (id, campaign_id, visibility, kind)
SELECT c.id, c.campaign_id, c.visibility, 'creature'::public.resource_kind
FROM public.creatures c;

INSERT INTO public.resources (id, campaign_id, visibility, kind)
SELECT ei.id, ei.campaign_id, ei.visibility, 'eldritch_invocation'::public.resource_kind
FROM public.eldritch_invocations ei;

INSERT INTO public.resources (id, campaign_id, visibility, kind)
SELECT s.id, s.campaign_id, s.visibility, 'spell'::public.resource_kind
FROM public.spells s;

INSERT INTO public.resources (id, campaign_id, visibility, kind)
SELECT w.id, w.campaign_id, w.visibility, 'equipment'::public.resource_kind
FROM public.weapons w;

-- Resource translations (name/page)
INSERT INTO public.resource_translations (resource_id, lang, name, page)
SELECT at.armor_id, at.lang, at.name, at.page
FROM public.armor_translations at;

INSERT INTO public.resource_translations (resource_id, lang, name, page)
SELECT ct.creature_id, ct.lang, ct.name, ct.page
FROM public.creature_translations ct;

INSERT INTO public.resource_translations (resource_id, lang, name, page)
SELECT eit.eldritch_invocation_id, eit.lang, eit.name, eit.page
FROM public.eldritch_invocation_translations eit;

INSERT INTO public.resource_translations (resource_id, lang, name, page)
SELECT st.spell_id, st.lang, st.name, st.page
FROM public.spell_translations st;

INSERT INTO public.resource_translations (resource_id, lang, name, page)
SELECT wt.weapon_id, wt.lang, wt.name, wt.page
FROM public.weapon_translations wt;
