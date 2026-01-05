
  create table "public"."language_translations" (
    "resource_id" uuid not null,
    "lang" text not null,
    "origin" text
      );


alter table "public"."language_translations" enable row level security;


  create table "public"."languages" (
    "resource_id" uuid not null,
    "rarity" public.language_rarity not null
      );


alter table "public"."languages" enable row level security;

CREATE INDEX idx_language_translations_lang ON public.language_translations USING btree (lang);

CREATE UNIQUE INDEX language_translations_pkey ON public.language_translations USING btree (resource_id, lang);

CREATE UNIQUE INDEX languages_pkey ON public.languages USING btree (resource_id);

alter table "public"."language_translations" add constraint "language_translations_pkey" PRIMARY KEY using index "language_translations_pkey";

alter table "public"."languages" add constraint "languages_pkey" PRIMARY KEY using index "languages_pkey";

alter table "public"."language_translations" add constraint "language_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."language_translations" validate constraint "language_translations_lang_fkey";

alter table "public"."language_translations" add constraint "language_translations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.languages(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."language_translations" validate constraint "language_translations_resource_id_fkey";

alter table "public"."languages" add constraint "languages_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."languages" validate constraint "languages_resource_id_fkey";

create type "public"."language_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "rarity" public.language_rarity, "origin" jsonb);

CREATE OR REPLACE FUNCTION public.create_language(p_campaign_id uuid, p_lang text, p_language jsonb, p_language_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.languages%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.languages, p_language);

  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_language || jsonb_build_object('kind', 'language'::public.resource_kind),
    p_language_translation
  );

  INSERT INTO public.languages (
    resource_id, rarity
  ) VALUES (
    v_id, r.rarity
  );

  perform public.upsert_language_translation(v_id, p_lang, p_language_translation);

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_language(p_id uuid)
 RETURNS public.language_row
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
    l.rarity,
    coalesce(tt.origin, '{}'::jsonb) AS origin
  FROM public.fetch_resource(p_id) AS r
  JOIN public.languages l ON l.resource_id = r.id
  LEFT JOIN (
    SELECT
      l.resource_id AS id,
      jsonb_object_agg(t.lang, t.origin) AS origin
    FROM public.languages l
    LEFT JOIN public.language_translations t ON t.resource_id = l.resource_id
    WHERE l.resource_id = p_id
    GROUP BY l.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_languages(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.language_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'language'::public.resource_kind
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
    l.rarity
  FROM base b
  JOIN public.languages l ON l.resource_id = b.id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.origin) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS origin
  FROM src s
  LEFT JOIN public.language_translations t ON t.resource_id = s.id
  LEFT JOIN (SELECT 1) _ ON true
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
  s.rarity,
  coalesce(tt.origin, '{}'::jsonb) AS origin
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

CREATE OR REPLACE FUNCTION public.update_language(p_id uuid, p_lang text, p_language jsonb, p_language_translation jsonb)
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
    p_language || jsonb_build_object('kind', 'language'::public.resource_kind),
    p_language_translation
  );

  UPDATE public.languages l
  SET (
    rarity
  ) = (
    SELECT r.rarity
    FROM jsonb_populate_record(null::public.languages, to_jsonb(l) || p_language) AS r
  )
  WHERE l.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_language_translation(p_id, p_lang, p_language_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_language_translation(p_id uuid, p_lang text, p_language_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  r public.language_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.language_translations, p_language_translation);

  INSERT INTO public.language_translations AS lt (
    resource_id, lang, origin
  ) VALUES (
    p_id, p_lang, r.origin
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    origin = excluded.origin;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_language_resource_kind()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'language'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a language', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."language_translations" to "anon";

grant insert on table "public"."language_translations" to "anon";

grant references on table "public"."language_translations" to "anon";

grant select on table "public"."language_translations" to "anon";

grant trigger on table "public"."language_translations" to "anon";

grant truncate on table "public"."language_translations" to "anon";

grant update on table "public"."language_translations" to "anon";

grant delete on table "public"."language_translations" to "authenticated";

grant insert on table "public"."language_translations" to "authenticated";

grant references on table "public"."language_translations" to "authenticated";

grant select on table "public"."language_translations" to "authenticated";

grant trigger on table "public"."language_translations" to "authenticated";

grant truncate on table "public"."language_translations" to "authenticated";

grant update on table "public"."language_translations" to "authenticated";

grant delete on table "public"."language_translations" to "service_role";

grant insert on table "public"."language_translations" to "service_role";

grant references on table "public"."language_translations" to "service_role";

grant select on table "public"."language_translations" to "service_role";

grant trigger on table "public"."language_translations" to "service_role";

grant truncate on table "public"."language_translations" to "service_role";

grant update on table "public"."language_translations" to "service_role";

grant delete on table "public"."languages" to "anon";

grant insert on table "public"."languages" to "anon";

grant references on table "public"."languages" to "anon";

grant select on table "public"."languages" to "anon";

grant trigger on table "public"."languages" to "anon";

grant truncate on table "public"."languages" to "anon";

grant update on table "public"."languages" to "anon";

grant delete on table "public"."languages" to "authenticated";

grant insert on table "public"."languages" to "authenticated";

grant references on table "public"."languages" to "authenticated";

grant select on table "public"."languages" to "authenticated";

grant trigger on table "public"."languages" to "authenticated";

grant truncate on table "public"."languages" to "authenticated";

grant update on table "public"."languages" to "authenticated";

grant delete on table "public"."languages" to "service_role";

grant insert on table "public"."languages" to "service_role";

grant references on table "public"."languages" to "service_role";

grant select on table "public"."languages" to "service_role";

grant trigger on table "public"."languages" to "service_role";

grant truncate on table "public"."languages" to "service_role";

grant update on table "public"."languages" to "service_role";


  create policy "Creators and GMs can create new language translations"
  on "public"."language_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete language translations"
  on "public"."language_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update language translations"
  on "public"."language_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read language translations"
  on "public"."language_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Creators and GMs can create new languages"
  on "public"."languages"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete languages"
  on "public"."languages"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update languages"
  on "public"."languages"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read languages"
  on "public"."languages"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));


CREATE TRIGGER enforce_language_resource_kind BEFORE INSERT OR UPDATE ON public.languages FOR EACH ROW EXECUTE FUNCTION public.validate_language_resource_kind();


