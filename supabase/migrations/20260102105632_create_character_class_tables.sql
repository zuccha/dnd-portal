
  create table "public"."character_class_translations" (
    "resource_id" uuid not null,
    "lang" text not null,
    "armor_proficiencies_extra" text,
    "starting_equipment" text,
    "weapon_proficiencies_extra" text
      );


alter table "public"."character_class_translations" enable row level security;


  create table "public"."character_classes" (
    "resource_id" uuid not null,
    "armor_proficiencies" public.armor_type[] not null,
    "hp_die" public.die_type not null,
    "primary_abilities" public.creature_ability[] not null,
    "saving_throw_proficiencies" public.creature_ability[] not null,
    "skill_proficiencies_pool" public.creature_skill[] not null,
    "skill_proficiencies_pool_quantity" smallint not null,
    "weapon_proficiencies" public.weapon_type[] not null
      );


alter table "public"."character_classes" enable row level security;

CREATE UNIQUE INDEX character_class_translations_pkey ON public.character_class_translations USING btree (resource_id, lang);

CREATE UNIQUE INDEX character_classes_pkey ON public.character_classes USING btree (resource_id);

alter table "public"."character_class_translations" add constraint "character_class_translations_pkey" PRIMARY KEY using index "character_class_translations_pkey";

alter table "public"."character_classes" add constraint "character_classes_pkey" PRIMARY KEY using index "character_classes_pkey";

alter table "public"."character_class_translations" add constraint "character_class_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."character_class_translations" validate constraint "character_class_translations_lang_fkey";

alter table "public"."character_class_translations" add constraint "character_class_translations_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.character_classes(resource_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."character_class_translations" validate constraint "character_class_translations_resource_id_fkey";

alter table "public"."character_classes" add constraint "character_classes_resource_id_fkey" FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."character_classes" validate constraint "character_classes_resource_id_fkey";

set check_function_bodies = off;

create type "public"."character_class_row" as ("campaign_id" uuid, "campaign_name" text, "id" uuid, "kind" public.resource_kind, "visibility" public.campaign_role, "name" jsonb, "page" jsonb, "armor_proficiencies" public.armor_type[], "hp_die" public.die_type, "primary_abilities" public.creature_ability[], "saving_throw_proficiencies" public.creature_ability[], "skill_proficiencies_pool" public.creature_skill[], "skill_proficiencies_pool_quantity" smallint, "weapon_proficiencies" public.weapon_type[], "armor_proficiencies_extra" jsonb, "starting_equipment" jsonb, "weapon_proficiencies_extra" jsonb);

CREATE OR REPLACE FUNCTION public.create_character_class(p_campaign_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.character_classes%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_classes, p_character_class);

  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_character_class || jsonb_build_object('kind', 'character_class'::public.resource_kind),
    p_character_class_translation
  );

  INSERT INTO public.character_classes (
    resource_id,
    primary_abilities,
    hp_die,
    saving_throw_proficiencies,
    skill_proficiencies_pool,
    skill_proficiencies_pool_quantity,
    weapon_proficiencies,
    armor_proficiencies
  ) VALUES (
    v_id,
    r.primary_abilities,
    r.hp_die,
    r.saving_throw_proficiencies,
    r.skill_proficiencies_pool,
    r.skill_proficiencies_pool_quantity,
    r.weapon_proficiencies,
    r.armor_proficiencies
  );

  perform public.upsert_character_class_translation(
    v_id,
    p_lang,
    p_character_class_translation
  );

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_character_class(p_id uuid)
 RETURNS public.character_class_row
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
    c.armor_proficiencies,
    c.hp_die,
    c.primary_abilities,
    c.saving_throw_proficiencies,
    c.skill_proficiencies_pool,
    c.skill_proficiencies_pool_quantity,
    c.weapon_proficiencies,
    coalesce(tt.armor_proficiencies_extra, '{}'::jsonb) AS armor_proficiencies_extra,
    coalesce(tt.starting_equipment, '{}'::jsonb) AS starting_equipment,
    coalesce(tt.weapon_proficiencies_extra, '{}'::jsonb) AS weapon_proficiencies_extra
  FROM public.fetch_resource(p_id) AS r
  JOIN public.character_classes c ON c.resource_id = r.id
  LEFT JOIN (
    SELECT
      c.resource_id AS id,
      jsonb_object_agg(t.lang, t.armor_proficiencies_extra) AS armor_proficiencies_extra,
      jsonb_object_agg(t.lang, t.starting_equipment) AS starting_equipment,
      jsonb_object_agg(t.lang, t.weapon_proficiencies_extra) AS weapon_proficiencies_extra
    FROM public.character_classes c
    LEFT JOIN public.character_class_translations t ON t.resource_id = c.resource_id
    WHERE c.resource_id = p_id
    GROUP BY c.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_character_classes(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS SETOF public.character_class_row
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'character_class'::public.resource_kind
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
    c.armor_proficiencies,
    c.hp_die,
    c.primary_abilities,
    c.saving_throw_proficiencies,
    c.skill_proficiencies_pool,
    c.skill_proficiencies_pool_quantity,
    c.weapon_proficiencies
  FROM base b
  JOIN public.character_classes c ON c.resource_id = b.id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.armor_proficiencies_extra) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS armor_proficiencies_extra,
    jsonb_object_agg(t.lang, t.starting_equipment)        FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS starting_equipment,
    jsonb_object_agg(t.lang, t.weapon_proficiencies_extra) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS weapon_proficiencies_extra
  FROM src s
  LEFT JOIN public.character_class_translations t ON t.resource_id = s.id
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
  s.armor_proficiencies,
  s.hp_die,
  s.primary_abilities,
  s.saving_throw_proficiencies,
  s.skill_proficiencies_pool,
  s.skill_proficiencies_pool_quantity,
  s.weapon_proficiencies,
  coalesce(tt.armor_proficiencies_extra, '{}'::jsonb) AS armor_proficiencies_extra,
  coalesce(tt.starting_equipment, '{}'::jsonb) AS starting_equipment,
  coalesce(tt.weapon_proficiencies_extra, '{}'::jsonb) AS weapon_proficiencies_extra
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

CREATE OR REPLACE FUNCTION public.update_character_class(p_id uuid, p_lang text, p_character_class jsonb, p_character_class_translation jsonb)
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
    p_character_class || jsonb_build_object('kind', 'character_class'::public.resource_kind),
    p_character_class_translation
  );

  UPDATE public.character_classes c
  SET (
    primary_abilities,
    hp_die,
    saving_throw_proficiencies,
    skill_proficiencies_pool,
    skill_proficiencies_pool_quantity,
    weapon_proficiencies,
    armor_proficiencies
  ) = (
    SELECT
      r.primary_abilities,
      r.hp_die,
      r.saving_throw_proficiencies,
      r.skill_proficiencies_pool,
      r.skill_proficiencies_pool_quantity,
      r.weapon_proficiencies,
      r.armor_proficiencies
    FROM jsonb_populate_record(null::public.character_classes, to_jsonb(c) || p_character_class) AS r
  )
  WHERE c.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_character_class_translation(p_id, p_lang, p_character_class_translation);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.upsert_character_class_translation(p_id uuid, p_lang text, p_character_class_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  r public.character_class_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.character_class_translations, p_character_class_translation);

  INSERT INTO public.character_class_translations AS ct (
    resource_id,
    lang,
    weapon_proficiencies_extra,
    armor_proficiencies_extra,
    starting_equipment
  ) VALUES (
    p_id,
    p_lang,
    r.weapon_proficiencies_extra,
    r.armor_proficiencies_extra,
    r.starting_equipment
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    weapon_proficiencies_extra = excluded.weapon_proficiencies_extra,
    armor_proficiencies_extra = excluded.armor_proficiencies_extra,
    starting_equipment = excluded.starting_equipment;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_character_class_resource_kind()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'character_class'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a character class', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."character_class_translations" to "anon";

grant insert on table "public"."character_class_translations" to "anon";

grant references on table "public"."character_class_translations" to "anon";

grant select on table "public"."character_class_translations" to "anon";

grant trigger on table "public"."character_class_translations" to "anon";

grant truncate on table "public"."character_class_translations" to "anon";

grant update on table "public"."character_class_translations" to "anon";

grant delete on table "public"."character_class_translations" to "authenticated";

grant insert on table "public"."character_class_translations" to "authenticated";

grant references on table "public"."character_class_translations" to "authenticated";

grant select on table "public"."character_class_translations" to "authenticated";

grant trigger on table "public"."character_class_translations" to "authenticated";

grant truncate on table "public"."character_class_translations" to "authenticated";

grant update on table "public"."character_class_translations" to "authenticated";

grant delete on table "public"."character_class_translations" to "service_role";

grant insert on table "public"."character_class_translations" to "service_role";

grant references on table "public"."character_class_translations" to "service_role";

grant select on table "public"."character_class_translations" to "service_role";

grant trigger on table "public"."character_class_translations" to "service_role";

grant truncate on table "public"."character_class_translations" to "service_role";

grant update on table "public"."character_class_translations" to "service_role";

grant delete on table "public"."character_classes" to "anon";

grant insert on table "public"."character_classes" to "anon";

grant references on table "public"."character_classes" to "anon";

grant select on table "public"."character_classes" to "anon";

grant trigger on table "public"."character_classes" to "anon";

grant truncate on table "public"."character_classes" to "anon";

grant update on table "public"."character_classes" to "anon";

grant delete on table "public"."character_classes" to "authenticated";

grant insert on table "public"."character_classes" to "authenticated";

grant references on table "public"."character_classes" to "authenticated";

grant select on table "public"."character_classes" to "authenticated";

grant trigger on table "public"."character_classes" to "authenticated";

grant truncate on table "public"."character_classes" to "authenticated";

grant update on table "public"."character_classes" to "authenticated";

grant delete on table "public"."character_classes" to "service_role";

grant insert on table "public"."character_classes" to "service_role";

grant references on table "public"."character_classes" to "service_role";

grant select on table "public"."character_classes" to "service_role";

grant trigger on table "public"."character_classes" to "service_role";

grant truncate on table "public"."character_classes" to "service_role";

grant update on table "public"."character_classes" to "service_role";


  create policy "Creators and GMs can create new character class translations"
  on "public"."character_class_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete character class translations"
  on "public"."character_class_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update character class translations"
  on "public"."character_class_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read character class translations"
  on "public"."character_class_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Creators and GMs can create new character classes"
  on "public"."character_classes"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can delete character classes"
  on "public"."character_classes"
  as permissive
  for delete
  to authenticated
using (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can update character classes"
  on "public"."character_classes"
  as permissive
  for update
  to authenticated
using (public.can_edit_resource(resource_id))
with check (public.can_edit_resource(resource_id));



  create policy "Users can read character classes"
  on "public"."character_classes"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));


CREATE TRIGGER enforce_character_class_resource_kind BEFORE INSERT OR UPDATE ON public.character_classes FOR EACH ROW EXECUTE FUNCTION public.validate_character_class_resource_kind();


