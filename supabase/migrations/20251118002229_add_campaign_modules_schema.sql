create extension if not exists "pg_net" with schema "extensions";

create type "public"."campaign_visibility" as enum ('public', 'private', 'purchasable');

create type "public"."module_role" as enum ('creator', 'owner');


  create table "public"."campaign_modules" (
    "campaign_id" uuid not null,
    "module_id" uuid not null,
    "added_at" timestamp with time zone not null default now()
      );


alter table "public"."campaign_modules" enable row level security;


  create table "public"."user_modules" (
    "user_id" uuid not null,
    "module_id" uuid not null,
    "role" public.module_role not null,
    "acquired_at" timestamp with time zone not null default now()
      );


alter table "public"."user_modules" enable row level security;

alter table "public"."campaigns" add column "creator_id" uuid;

alter table "public"."campaigns" add column "is_module" boolean not null default false;

alter table "public"."campaigns" add column "visibility" public.campaign_visibility not null default 'private'::public.campaign_visibility;

CREATE UNIQUE INDEX campaign_modules_pkey ON public.campaign_modules USING btree (campaign_id, module_id);

CREATE INDEX idx_campaign_modules_campaign_id ON public.campaign_modules USING btree (campaign_id);

CREATE INDEX idx_campaign_modules_module_id ON public.campaign_modules USING btree (module_id);

CREATE INDEX idx_campaigns_creator_id ON public.campaigns USING btree (creator_id);

CREATE INDEX idx_campaigns_is_module ON public.campaigns USING btree (is_module) WHERE (is_module = true);

CREATE INDEX idx_user_modules_module_id ON public.user_modules USING btree (module_id);

CREATE INDEX idx_user_modules_user_id ON public.user_modules USING btree (user_id);

CREATE UNIQUE INDEX user_modules_pkey ON public.user_modules USING btree (user_id, module_id);

alter table "public"."campaign_modules" add constraint "campaign_modules_pkey" PRIMARY KEY using index "campaign_modules_pkey";

alter table "public"."user_modules" add constraint "user_modules_pkey" PRIMARY KEY using index "user_modules_pkey";

alter table "public"."campaign_modules" add constraint "campaign_modules_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."campaign_modules" validate constraint "campaign_modules_campaign_id_fkey";

alter table "public"."campaign_modules" add constraint "campaign_modules_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public.campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."campaign_modules" validate constraint "campaign_modules_module_id_fkey";

alter table "public"."campaigns" add constraint "campaigns_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."campaigns" validate constraint "campaigns_creator_id_fkey";

alter table "public"."user_modules" add constraint "user_modules_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public.campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."user_modules" validate constraint "user_modules_module_id_fkey";

alter table "public"."user_modules" add constraint "user_modules_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_modules" validate constraint "user_modules_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.validate_campaign_module_is_module()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "public"."campaigns"
    WHERE "id" = NEW."module_id" AND "is_module" = true
  ) THEN
    RAISE EXCEPTION 'Referenced campaign % is not a module', NEW."module_id";
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_user_module_is_module()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "public"."campaigns"
    WHERE "id" = NEW."module_id" AND "is_module" = true
  ) THEN
    RAISE EXCEPTION 'Referenced campaign % is not a module', NEW."module_id";
  END IF;
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."campaign_modules" to "anon";

grant insert on table "public"."campaign_modules" to "anon";

grant references on table "public"."campaign_modules" to "anon";

grant select on table "public"."campaign_modules" to "anon";

grant trigger on table "public"."campaign_modules" to "anon";

grant truncate on table "public"."campaign_modules" to "anon";

grant update on table "public"."campaign_modules" to "anon";

grant delete on table "public"."campaign_modules" to "authenticated";

grant insert on table "public"."campaign_modules" to "authenticated";

grant references on table "public"."campaign_modules" to "authenticated";

grant select on table "public"."campaign_modules" to "authenticated";

grant trigger on table "public"."campaign_modules" to "authenticated";

grant truncate on table "public"."campaign_modules" to "authenticated";

grant update on table "public"."campaign_modules" to "authenticated";

grant delete on table "public"."campaign_modules" to "service_role";

grant insert on table "public"."campaign_modules" to "service_role";

grant references on table "public"."campaign_modules" to "service_role";

grant select on table "public"."campaign_modules" to "service_role";

grant trigger on table "public"."campaign_modules" to "service_role";

grant truncate on table "public"."campaign_modules" to "service_role";

grant update on table "public"."campaign_modules" to "service_role";

grant delete on table "public"."user_modules" to "anon";

grant insert on table "public"."user_modules" to "anon";

grant references on table "public"."user_modules" to "anon";

grant select on table "public"."user_modules" to "anon";

grant trigger on table "public"."user_modules" to "anon";

grant truncate on table "public"."user_modules" to "anon";

grant update on table "public"."user_modules" to "anon";

grant delete on table "public"."user_modules" to "authenticated";

grant insert on table "public"."user_modules" to "authenticated";

grant references on table "public"."user_modules" to "authenticated";

grant select on table "public"."user_modules" to "authenticated";

grant trigger on table "public"."user_modules" to "authenticated";

grant truncate on table "public"."user_modules" to "authenticated";

grant update on table "public"."user_modules" to "authenticated";

grant delete on table "public"."user_modules" to "service_role";

grant insert on table "public"."user_modules" to "service_role";

grant references on table "public"."user_modules" to "service_role";

grant select on table "public"."user_modules" to "service_role";

grant trigger on table "public"."user_modules" to "service_role";

grant truncate on table "public"."user_modules" to "service_role";

grant update on table "public"."user_modules" to "service_role";


  create policy "DMs can add modules to campaigns"
  on "public"."campaign_modules"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.campaign_players cp
  WHERE ((cp.campaign_id = campaign_modules.campaign_id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role)))));



  create policy "DMs can remove modules from campaigns"
  on "public"."campaign_modules"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.campaign_players cp
  WHERE ((cp.campaign_id = campaign_modules.campaign_id) AND (cp.user_id = ( SELECT auth.uid() AS uid)) AND (cp.role = 'game_master'::public.campaign_role)))));



  create policy "Players can view modules used by campaigns they joined"
  on "public"."campaign_modules"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.campaign_players cp
  WHERE ((cp.campaign_id = campaign_modules.campaign_id) AND (cp.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Players can read modules they own"
  on "public"."campaigns"
  as permissive
  for select
  to authenticated
using (((is_module = true) AND (EXISTS ( SELECT 1
   FROM public.user_modules um
  WHERE ((um.module_id = campaigns.id) AND (um.user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "Players can read public modules"
  on "public"."campaigns"
  as permissive
  for select
  to authenticated
using (((is_module = true) AND (visibility = 'public'::public.campaign_visibility)));



  create policy "Creators can manage module ownership"
  on "public"."user_modules"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.user_modules um
  WHERE ((um.module_id = user_modules.module_id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role)))));



  create policy "Creators can revoke module ownership"
  on "public"."user_modules"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.user_modules um
  WHERE ((um.module_id = user_modules.module_id) AND (um.user_id = ( SELECT auth.uid() AS uid)) AND (um.role = 'creator'::public.module_role)))));



  create policy "Users can view their own module ownership"
  on "public"."user_modules"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));


CREATE TRIGGER enforce_campaign_module_is_module BEFORE INSERT OR UPDATE ON public.campaign_modules FOR EACH ROW EXECUTE FUNCTION public.validate_campaign_module_is_module();

CREATE TRIGGER enforce_user_module_is_module BEFORE INSERT OR UPDATE ON public.user_modules FOR EACH ROW EXECUTE FUNCTION public.validate_user_module_is_module();


