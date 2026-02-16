create type "public"."source_ownership" as enum ('guest', 'owner');

create type "public"."source_role" as enum ('editor', 'admin');

create type "public"."source_visibility" as enum ('private', 'public', 'purchasable');


  create table "public"."source_includes" (
    "source_id" uuid not null,
    "include_id" uuid not null,
    "added_at" timestamp with time zone not null default now()
      );


alter table "public"."source_includes" enable row level security;


  create table "public"."source_ownerships" (
    "user_id" uuid not null,
    "source_id" uuid not null,
    "role" public.source_ownership not null,
    "acquired_at" timestamp with time zone not null default now()
      );


alter table "public"."source_ownerships" enable row level security;


  create table "public"."source_requires" (
    "source_id" uuid not null,
    "required_id" uuid not null,
    "added_at" timestamp with time zone not null default now()
      );


alter table "public"."source_requires" enable row level security;


  create table "public"."source_roles" (
    "user_id" uuid not null,
    "source_id" uuid not null,
    "role" public.source_role not null,
    "assigned_at" timestamp with time zone not null default now()
      );


alter table "public"."source_roles" enable row level security;


  create table "public"."source_translations" (
    "source_id" uuid not null,
    "lang" text not null,
    "name" text not null default ''::text
      );


alter table "public"."source_translations" enable row level security;


  create table "public"."sources" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "code" text not null default ''::text,
    "creator_id" uuid,
    "visibility" public.source_visibility not null default 'private'::public.source_visibility
      );


alter table "public"."sources" enable row level security;

CREATE INDEX idx_source_includes_include_id ON public.source_includes USING btree (include_id);

CREATE INDEX idx_source_includes_source_id ON public.source_includes USING btree (source_id);

CREATE INDEX idx_source_ownerships_source_id ON public.source_ownerships USING btree (source_id);

CREATE INDEX idx_source_ownerships_user_id ON public.source_ownerships USING btree (user_id);

CREATE INDEX idx_source_requires_required_id ON public.source_requires USING btree (required_id);

CREATE INDEX idx_source_requires_source_id ON public.source_requires USING btree (source_id);

CREATE INDEX idx_source_roles_source_id ON public.source_roles USING btree (source_id);

CREATE INDEX idx_source_roles_user_id ON public.source_roles USING btree (user_id);

CREATE INDEX idx_sources_creator_id ON public.sources USING btree (creator_id);

CREATE UNIQUE INDEX source_includes_pkey ON public.source_includes USING btree (source_id, include_id);

CREATE UNIQUE INDEX source_ownerships_pkey ON public.source_ownerships USING btree (user_id, source_id);

CREATE UNIQUE INDEX source_requires_pkey ON public.source_requires USING btree (source_id, required_id);

CREATE UNIQUE INDEX source_roles_pkey ON public.source_roles USING btree (user_id, source_id);

CREATE UNIQUE INDEX source_translations_pkey ON public.source_translations USING btree (source_id, lang);

CREATE UNIQUE INDEX sources_pkey ON public.sources USING btree (id);

alter table "public"."source_includes" add constraint "source_includes_pkey" PRIMARY KEY using index "source_includes_pkey";

alter table "public"."source_ownerships" add constraint "source_ownerships_pkey" PRIMARY KEY using index "source_ownerships_pkey";

alter table "public"."source_requires" add constraint "source_requires_pkey" PRIMARY KEY using index "source_requires_pkey";

alter table "public"."source_roles" add constraint "source_roles_pkey" PRIMARY KEY using index "source_roles_pkey";

alter table "public"."source_translations" add constraint "source_translations_pkey" PRIMARY KEY using index "source_translations_pkey";

alter table "public"."sources" add constraint "sources_pkey" PRIMARY KEY using index "sources_pkey";

alter table "public"."source_includes" add constraint "source_includes_include_id_fkey" FOREIGN KEY (include_id) REFERENCES public.sources(id) ON DELETE CASCADE not valid;

alter table "public"."source_includes" validate constraint "source_includes_include_id_fkey";

alter table "public"."source_includes" add constraint "source_includes_no_self" CHECK ((source_id <> include_id)) not valid;

alter table "public"."source_includes" validate constraint "source_includes_no_self";

alter table "public"."source_includes" add constraint "source_includes_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE CASCADE not valid;

alter table "public"."source_includes" validate constraint "source_includes_source_id_fkey";

alter table "public"."source_ownerships" add constraint "source_ownerships_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE CASCADE not valid;

alter table "public"."source_ownerships" validate constraint "source_ownerships_source_id_fkey";

alter table "public"."source_ownerships" add constraint "source_ownerships_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."source_ownerships" validate constraint "source_ownerships_user_id_fkey";

alter table "public"."source_requires" add constraint "source_requires_no_self" CHECK ((source_id <> required_id)) not valid;

alter table "public"."source_requires" validate constraint "source_requires_no_self";

alter table "public"."source_requires" add constraint "source_requires_required_id_fkey" FOREIGN KEY (required_id) REFERENCES public.sources(id) ON DELETE CASCADE not valid;

alter table "public"."source_requires" validate constraint "source_requires_required_id_fkey";

alter table "public"."source_requires" add constraint "source_requires_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE CASCADE not valid;

alter table "public"."source_requires" validate constraint "source_requires_source_id_fkey";

alter table "public"."source_roles" add constraint "source_roles_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE CASCADE not valid;

alter table "public"."source_roles" validate constraint "source_roles_source_id_fkey";

alter table "public"."source_roles" add constraint "source_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."source_roles" validate constraint "source_roles_user_id_fkey";

alter table "public"."source_translations" add constraint "source_translations_lang_fkey" FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."source_translations" validate constraint "source_translations_lang_fkey";

alter table "public"."source_translations" add constraint "source_translations_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.sources(id) ON DELETE CASCADE not valid;

alter table "public"."source_translations" validate constraint "source_translations_source_id_fkey";

alter table "public"."sources" add constraint "sources_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."sources" validate constraint "sources_creator_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_admin_source(p_source_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.sources s
    WHERE s.id = p_source_id
      AND (
        s.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1 FROM public.source_roles sr
          WHERE sr.source_id = s.id
            AND sr.user_id = (SELECT auth.uid() AS uid)
            AND sr.role = 'admin'::public.source_role
        )
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_source_resources(p_source_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.sources s
    WHERE s.id = p_source_id
      AND (
        s.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1 FROM public.source_roles sr
          WHERE sr.source_id = s.id
            AND sr.user_id = (SELECT auth.uid() AS uid)
            AND sr.role IN ('admin'::public.source_role, 'editor'::public.source_role)
        )
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_source(p_source_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.sources s
    WHERE s.id = p_source_id
      AND (
        s.visibility IN ('public'::public.source_visibility, 'purchasable'::public.source_visibility)
        OR s.creator_id = (SELECT auth.uid() AS uid)
        OR EXISTS (
          SELECT 1 FROM public.source_ownerships so
          WHERE so.source_id = s.id
            AND so.user_id = (SELECT auth.uid() AS uid)
        )
        OR EXISTS (
          SELECT 1 FROM public.source_roles sr
          WHERE sr.source_id = s.id
            AND sr.user_id = (SELECT auth.uid() AS uid)
        )
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_source_creator_roles()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NEW.creator_id IS NOT NULL THEN
    INSERT INTO public.source_ownerships (user_id, source_id, role)
    VALUES (NEW.creator_id, NEW.id, 'owner'::public.source_ownership)
    ON CONFLICT (user_id, source_id) DO UPDATE
    SET role = 'owner'::public.source_ownership;

    INSERT INTO public.source_roles (user_id, source_id, role)
    VALUES (NEW.creator_id, NEW.id, 'admin'::public.source_role)
    ON CONFLICT (user_id, source_id) DO UPDATE
    SET role = 'admin'::public.source_role;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_source_creator_transfer()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_uid uuid;
BEGIN
  IF NEW.creator_id IS NULL THEN
    RAISE EXCEPTION 'Creator cannot be null';
  END IF;

  v_uid := (SELECT auth.uid() AS uid);

  -- only current creator can transfer
  IF OLD.creator_id IS NOT NULL AND v_uid <> OLD.creator_id THEN
    RAISE EXCEPTION 'Only creator can transfer ownership';
  END IF;

  -- new creator must already be admin
  IF NOT EXISTS (
    SELECT 1 FROM public.source_roles sr
    WHERE sr.source_id = NEW.id
      AND sr.user_id = NEW.creator_id
      AND sr.role = 'admin'::public.source_role
  ) THEN
    RAISE EXCEPTION 'New creator must be an admin';
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_source_ownership_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF OLD.role = 'owner'::public.source_ownership THEN
    RAISE EXCEPTION 'Ownership cannot be revoked';
  END IF;

  IF NOT public.can_admin_source(OLD.source_id)
     AND OLD.user_id <> (SELECT auth.uid() AS uid) THEN
    RAISE EXCEPTION 'Only admins or the guest can revoke guests';
  END IF;

  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_source_ownership_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- only allow guest -> owner upgrade
  IF OLD.role = 'guest'::public.source_ownership
     AND NEW.role = 'owner'::public.source_ownership
     AND public.can_admin_source(NEW.source_id) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Ownership role can only be upgraded from guest to owner';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_source_ownership_write()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- only admins can grant ownership or guest
  IF NOT public.can_admin_source(NEW.source_id) THEN
    RAISE EXCEPTION 'Only admins can manage ownerships';
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_source_role_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_creator uuid;
  v_uid uuid;
BEGIN
  SELECT creator_id INTO v_creator
  FROM public.sources s
  WHERE s.id = OLD.source_id;

  v_uid := (SELECT auth.uid() AS uid);

  -- creator cannot remove their own role
  IF v_creator IS NOT NULL AND OLD.user_id = v_creator THEN
    RAISE EXCEPTION 'Creator role cannot be removed';
  END IF;

  -- admin role: only creator can revoke others; self-revoke allowed
  IF OLD.role = 'admin'::public.source_role
     AND v_creator IS NOT NULL
     AND v_uid <> v_creator
     AND v_uid <> OLD.user_id THEN
    RAISE EXCEPTION 'Only creator can revoke admin role from others';
  END IF;

  -- editor role: admins can revoke others; self-revoke allowed
  IF OLD.role = 'editor'::public.source_role
     AND v_uid <> OLD.user_id
     AND NOT public.can_admin_source(OLD.source_id) THEN
    RAISE EXCEPTION 'Only admins can revoke editor roles';
  END IF;

  -- fallback: must be creator or self
  IF v_uid <> OLD.user_id AND v_uid <> v_creator THEN
    RAISE EXCEPTION 'Not allowed to revoke this role';
  END IF;

  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_source_role_write()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_creator uuid;
BEGIN
  SELECT creator_id INTO v_creator
  FROM public.sources s
  WHERE s.id = NEW.source_id;

  -- role can only be assigned to owners
  IF NOT EXISTS (
    SELECT 1 FROM public.source_ownerships so
    WHERE so.source_id = NEW.source_id
      AND so.user_id = NEW.user_id
      AND so.role = 'owner'::public.source_ownership
  ) THEN
    RAISE EXCEPTION 'Role can only be assigned to owners';
  END IF;

  -- admin role can only be assigned by the creator
  IF NEW.role = 'admin'::public.source_role
     AND v_creator IS NOT NULL
     AND v_creator <> (SELECT auth.uid() AS uid) THEN
    RAISE EXCEPTION 'Only the creator can assign admin role';
  END IF;

  -- editor role can only be assigned by admins
  IF NEW.role = 'editor'::public.source_role
     AND NOT public.can_admin_source(NEW.source_id) THEN
    RAISE EXCEPTION 'Only admins can assign editor role';
  END IF;

  RETURN NEW;
END;
$function$
;

grant delete on table "public"."source_includes" to "anon";

grant insert on table "public"."source_includes" to "anon";

grant references on table "public"."source_includes" to "anon";

grant select on table "public"."source_includes" to "anon";

grant trigger on table "public"."source_includes" to "anon";

grant truncate on table "public"."source_includes" to "anon";

grant update on table "public"."source_includes" to "anon";

grant delete on table "public"."source_includes" to "authenticated";

grant insert on table "public"."source_includes" to "authenticated";

grant references on table "public"."source_includes" to "authenticated";

grant select on table "public"."source_includes" to "authenticated";

grant trigger on table "public"."source_includes" to "authenticated";

grant truncate on table "public"."source_includes" to "authenticated";

grant update on table "public"."source_includes" to "authenticated";

grant delete on table "public"."source_includes" to "service_role";

grant insert on table "public"."source_includes" to "service_role";

grant references on table "public"."source_includes" to "service_role";

grant select on table "public"."source_includes" to "service_role";

grant trigger on table "public"."source_includes" to "service_role";

grant truncate on table "public"."source_includes" to "service_role";

grant update on table "public"."source_includes" to "service_role";

grant delete on table "public"."source_ownerships" to "anon";

grant insert on table "public"."source_ownerships" to "anon";

grant references on table "public"."source_ownerships" to "anon";

grant select on table "public"."source_ownerships" to "anon";

grant trigger on table "public"."source_ownerships" to "anon";

grant truncate on table "public"."source_ownerships" to "anon";

grant update on table "public"."source_ownerships" to "anon";

grant delete on table "public"."source_ownerships" to "authenticated";

grant insert on table "public"."source_ownerships" to "authenticated";

grant references on table "public"."source_ownerships" to "authenticated";

grant select on table "public"."source_ownerships" to "authenticated";

grant trigger on table "public"."source_ownerships" to "authenticated";

grant truncate on table "public"."source_ownerships" to "authenticated";

grant update on table "public"."source_ownerships" to "authenticated";

grant delete on table "public"."source_ownerships" to "service_role";

grant insert on table "public"."source_ownerships" to "service_role";

grant references on table "public"."source_ownerships" to "service_role";

grant select on table "public"."source_ownerships" to "service_role";

grant trigger on table "public"."source_ownerships" to "service_role";

grant truncate on table "public"."source_ownerships" to "service_role";

grant update on table "public"."source_ownerships" to "service_role";

grant delete on table "public"."source_requires" to "anon";

grant insert on table "public"."source_requires" to "anon";

grant references on table "public"."source_requires" to "anon";

grant select on table "public"."source_requires" to "anon";

grant trigger on table "public"."source_requires" to "anon";

grant truncate on table "public"."source_requires" to "anon";

grant update on table "public"."source_requires" to "anon";

grant delete on table "public"."source_requires" to "authenticated";

grant insert on table "public"."source_requires" to "authenticated";

grant references on table "public"."source_requires" to "authenticated";

grant select on table "public"."source_requires" to "authenticated";

grant trigger on table "public"."source_requires" to "authenticated";

grant truncate on table "public"."source_requires" to "authenticated";

grant update on table "public"."source_requires" to "authenticated";

grant delete on table "public"."source_requires" to "service_role";

grant insert on table "public"."source_requires" to "service_role";

grant references on table "public"."source_requires" to "service_role";

grant select on table "public"."source_requires" to "service_role";

grant trigger on table "public"."source_requires" to "service_role";

grant truncate on table "public"."source_requires" to "service_role";

grant update on table "public"."source_requires" to "service_role";

grant delete on table "public"."source_roles" to "anon";

grant insert on table "public"."source_roles" to "anon";

grant references on table "public"."source_roles" to "anon";

grant select on table "public"."source_roles" to "anon";

grant trigger on table "public"."source_roles" to "anon";

grant truncate on table "public"."source_roles" to "anon";

grant update on table "public"."source_roles" to "anon";

grant delete on table "public"."source_roles" to "authenticated";

grant insert on table "public"."source_roles" to "authenticated";

grant references on table "public"."source_roles" to "authenticated";

grant select on table "public"."source_roles" to "authenticated";

grant trigger on table "public"."source_roles" to "authenticated";

grant truncate on table "public"."source_roles" to "authenticated";

grant update on table "public"."source_roles" to "authenticated";

grant delete on table "public"."source_roles" to "service_role";

grant insert on table "public"."source_roles" to "service_role";

grant references on table "public"."source_roles" to "service_role";

grant select on table "public"."source_roles" to "service_role";

grant trigger on table "public"."source_roles" to "service_role";

grant truncate on table "public"."source_roles" to "service_role";

grant update on table "public"."source_roles" to "service_role";

grant delete on table "public"."source_translations" to "anon";

grant insert on table "public"."source_translations" to "anon";

grant references on table "public"."source_translations" to "anon";

grant select on table "public"."source_translations" to "anon";

grant trigger on table "public"."source_translations" to "anon";

grant truncate on table "public"."source_translations" to "anon";

grant update on table "public"."source_translations" to "anon";

grant delete on table "public"."source_translations" to "authenticated";

grant insert on table "public"."source_translations" to "authenticated";

grant references on table "public"."source_translations" to "authenticated";

grant select on table "public"."source_translations" to "authenticated";

grant trigger on table "public"."source_translations" to "authenticated";

grant truncate on table "public"."source_translations" to "authenticated";

grant update on table "public"."source_translations" to "authenticated";

grant delete on table "public"."source_translations" to "service_role";

grant insert on table "public"."source_translations" to "service_role";

grant references on table "public"."source_translations" to "service_role";

grant select on table "public"."source_translations" to "service_role";

grant trigger on table "public"."source_translations" to "service_role";

grant truncate on table "public"."source_translations" to "service_role";

grant update on table "public"."source_translations" to "service_role";

grant delete on table "public"."sources" to "anon";

grant insert on table "public"."sources" to "anon";

grant references on table "public"."sources" to "anon";

grant select on table "public"."sources" to "anon";

grant trigger on table "public"."sources" to "anon";

grant truncate on table "public"."sources" to "anon";

grant update on table "public"."sources" to "anon";

grant delete on table "public"."sources" to "authenticated";

grant insert on table "public"."sources" to "authenticated";

grant references on table "public"."sources" to "authenticated";

grant select on table "public"."sources" to "authenticated";

grant trigger on table "public"."sources" to "authenticated";

grant truncate on table "public"."sources" to "authenticated";

grant update on table "public"."sources" to "authenticated";

grant delete on table "public"."sources" to "service_role";

grant insert on table "public"."sources" to "service_role";

grant references on table "public"."sources" to "service_role";

grant select on table "public"."sources" to "service_role";

grant trigger on table "public"."sources" to "service_role";

grant truncate on table "public"."sources" to "service_role";

grant update on table "public"."sources" to "service_role";


  create policy "Admins can manage source includes"
  on "public"."source_includes"
  as permissive
  for insert
  to authenticated
with check ((public.can_admin_source(source_id) AND ((EXISTS ( SELECT 1
   FROM public.sources s
  WHERE ((s.id = source_includes.include_id) AND (s.visibility = 'public'::public.source_visibility)))) OR (EXISTS ( SELECT 1
   FROM public.source_ownerships so
  WHERE ((so.source_id = source_includes.include_id) AND (so.user_id = ( SELECT auth.uid() AS uid)) AND (so.role = 'owner'::public.source_ownership)))))));



  create policy "Admins can remove source includes"
  on "public"."source_includes"
  as permissive
  for delete
  to authenticated
using (public.can_admin_source(source_id));



  create policy "Users can read source includes"
  on "public"."source_includes"
  as permissive
  for select
  to anon, authenticated
using ((public.can_read_source(source_id) AND public.can_read_source(include_id)));



  create policy "Admins can delete source ownerships"
  on "public"."source_ownerships"
  as permissive
  for delete
  to authenticated
using (public.can_admin_source(source_id));



  create policy "Admins can manage source ownerships"
  on "public"."source_ownerships"
  as permissive
  for insert
  to authenticated
with check (public.can_admin_source(source_id));



  create policy "Admins can update source ownerships"
  on "public"."source_ownerships"
  as permissive
  for update
  to authenticated
using (public.can_admin_source(source_id))
with check (public.can_admin_source(source_id));



  create policy "Users can read source ownerships"
  on "public"."source_ownerships"
  as permissive
  for select
  to authenticated
using (((user_id = ( SELECT auth.uid() AS uid)) OR public.can_admin_source(source_id)));



  create policy "Admins can manage source requires"
  on "public"."source_requires"
  as permissive
  for insert
  to authenticated
with check ((public.can_admin_source(source_id) AND ((EXISTS ( SELECT 1
   FROM public.sources s
  WHERE ((s.id = source_requires.required_id) AND (s.visibility = 'public'::public.source_visibility)))) OR (EXISTS ( SELECT 1
   FROM public.source_ownerships so
  WHERE ((so.source_id = source_requires.required_id) AND (so.user_id = ( SELECT auth.uid() AS uid)) AND (so.role = 'owner'::public.source_ownership)))))));



  create policy "Admins can remove source requires"
  on "public"."source_requires"
  as permissive
  for delete
  to authenticated
using (public.can_admin_source(source_id));



  create policy "Users can read source requires"
  on "public"."source_requires"
  as permissive
  for select
  to anon, authenticated
using ((public.can_read_source(source_id) AND public.can_read_source(required_id)));



  create policy "Admins can delete source roles"
  on "public"."source_roles"
  as permissive
  for delete
  to authenticated
using ((public.can_admin_source(source_id) OR (user_id = ( SELECT auth.uid() AS uid))));



  create policy "Admins can manage source roles (editor only)"
  on "public"."source_roles"
  as permissive
  for insert
  to authenticated
with check ((public.can_admin_source(source_id) AND (role = 'editor'::public.source_role)));



  create policy "Admins can update source roles"
  on "public"."source_roles"
  as permissive
  for update
  to authenticated
using (public.can_admin_source(source_id))
with check (public.can_admin_source(source_id));



  create policy "Creator can assign admin role"
  on "public"."source_roles"
  as permissive
  for insert
  to authenticated
with check (((role = 'admin'::public.source_role) AND (EXISTS ( SELECT 1
   FROM public.sources s
  WHERE ((s.id = source_roles.source_id) AND (s.creator_id = ( SELECT auth.uid() AS uid)))))));



  create policy "Users can read source roles"
  on "public"."source_roles"
  as permissive
  for select
  to authenticated
using (((user_id = ( SELECT auth.uid() AS uid)) OR public.can_admin_source(source_id)));



  create policy "Admins can create source translations"
  on "public"."source_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_admin_source(source_id));



  create policy "Admins can delete source translations"
  on "public"."source_translations"
  as permissive
  for delete
  to authenticated
using (public.can_admin_source(source_id));



  create policy "Admins can update source translations"
  on "public"."source_translations"
  as permissive
  for update
  to authenticated
using (public.can_admin_source(source_id))
with check (public.can_admin_source(source_id));



  create policy "Users can read source translations"
  on "public"."source_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_source(source_id));



  create policy "Admins can delete sources"
  on "public"."sources"
  as permissive
  for delete
  to authenticated
using (public.can_admin_source(id));



  create policy "Admins can update sources"
  on "public"."sources"
  as permissive
  for update
  to authenticated
using (public.can_admin_source(id))
with check (public.can_admin_source(id));



  create policy "Authenticated users can create sources"
  on "public"."sources"
  as permissive
  for insert
  to authenticated
with check ((creator_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can read sources"
  on "public"."sources"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_source(id));


CREATE TRIGGER validate_source_ownership_delete BEFORE DELETE ON public.source_ownerships FOR EACH ROW EXECUTE FUNCTION public.validate_source_ownership_delete();

CREATE TRIGGER validate_source_ownership_update BEFORE UPDATE ON public.source_ownerships FOR EACH ROW EXECUTE FUNCTION public.validate_source_ownership_update();

CREATE TRIGGER validate_source_ownership_write BEFORE INSERT ON public.source_ownerships FOR EACH ROW EXECUTE FUNCTION public.validate_source_ownership_write();

CREATE TRIGGER validate_source_role_delete BEFORE DELETE ON public.source_roles FOR EACH ROW EXECUTE FUNCTION public.validate_source_role_delete();

CREATE TRIGGER validate_source_role_write BEFORE INSERT OR UPDATE ON public.source_roles FOR EACH ROW EXECUTE FUNCTION public.validate_source_role_write();

CREATE TRIGGER enforce_source_creator_roles AFTER INSERT OR UPDATE OF creator_id ON public.sources FOR EACH ROW EXECUTE FUNCTION public.ensure_source_creator_roles();

CREATE TRIGGER validate_source_creator_transfer BEFORE UPDATE OF creator_id ON public.sources FOR EACH ROW EXECUTE FUNCTION public.validate_source_creator_transfer();


