
  create table "public"."module_dependencies" (
    "module_id" uuid not null,
    "dependency_id" uuid not null,
    "added_at" timestamp with time zone not null default now()
      );


alter table "public"."module_dependencies" enable row level security;

CREATE INDEX idx_module_dependencies_dependency_id ON public.module_dependencies USING btree (dependency_id);

CREATE INDEX idx_module_dependencies_module_id ON public.module_dependencies USING btree (module_id);

CREATE UNIQUE INDEX module_dependencies_pkey ON public.module_dependencies USING btree (module_id, dependency_id);

alter table "public"."module_dependencies" add constraint "module_dependencies_pkey" PRIMARY KEY using index "module_dependencies_pkey";

alter table "public"."module_dependencies" add constraint "module_dependencies_dependency_id_fkey" FOREIGN KEY (dependency_id) REFERENCES public.campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."module_dependencies" validate constraint "module_dependencies_dependency_id_fkey";

alter table "public"."module_dependencies" add constraint "module_dependencies_module_id_fkey" FOREIGN KEY (module_id) REFERENCES public.campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."module_dependencies" validate constraint "module_dependencies_module_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.validate_module_dependency_is_module()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = NEW.module_id AND is_module = true
  ) THEN
    RAISE EXCEPTION 'Referenced module % is not a module', NEW.module_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = NEW.dependency_id AND is_module = true
  ) THEN
    RAISE EXCEPTION 'Referenced dependency % is not a module', NEW.dependency_id;
  END IF;

  IF NEW.module_id = NEW.dependency_id THEN
    RAISE EXCEPTION 'Module % cannot depend on itself', NEW.module_id;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.campaign_resource_ids(p_campaign_id uuid, p_campaign_filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id uuid)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH prefs AS (
    SELECT
      -- include these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_campaign_filter) AS e(key, value)
        WHERE e.value = 'true'
      ) AS ids_inc,
      -- exclude these ids
      (
        SELECT coalesce(array_agg(e.key::uuid), null)
        FROM jsonb_each_text(p_campaign_filter) AS e(key, value)
        WHERE e.value = 'false'
      ) AS ids_exc
  ),
  base_ids AS (
    SELECT p_campaign_id AS id
    UNION
    SELECT cm.module_id
    FROM public.campaign_modules cm
    WHERE cm.campaign_id = p_campaign_id
  ),
  module_tree AS (
    SELECT b.id, ARRAY[b.id] AS path
    FROM base_ids b
    UNION ALL
    SELECT md.dependency_id, mt.path || md.dependency_id
    FROM public.module_dependencies md
    JOIN module_tree mt ON md.module_id = mt.id
    WHERE NOT md.dependency_id = ANY(mt.path)
  ),
  all_ids AS (
    SELECT DISTINCT id FROM module_tree
  )
  SELECT a.id
  FROM all_ids a, prefs p
  WHERE (p.ids_inc IS NULL OR a.id = ANY(p.ids_inc))
    AND (p.ids_exc IS NULL OR NOT (a.id = ANY(p.ids_exc)));
$function$
;

grant delete on table "public"."module_dependencies" to "anon";

grant insert on table "public"."module_dependencies" to "anon";

grant references on table "public"."module_dependencies" to "anon";

grant select on table "public"."module_dependencies" to "anon";

grant trigger on table "public"."module_dependencies" to "anon";

grant truncate on table "public"."module_dependencies" to "anon";

grant update on table "public"."module_dependencies" to "anon";

grant delete on table "public"."module_dependencies" to "authenticated";

grant insert on table "public"."module_dependencies" to "authenticated";

grant references on table "public"."module_dependencies" to "authenticated";

grant select on table "public"."module_dependencies" to "authenticated";

grant trigger on table "public"."module_dependencies" to "authenticated";

grant truncate on table "public"."module_dependencies" to "authenticated";

grant update on table "public"."module_dependencies" to "authenticated";

grant delete on table "public"."module_dependencies" to "service_role";

grant insert on table "public"."module_dependencies" to "service_role";

grant references on table "public"."module_dependencies" to "service_role";

grant select on table "public"."module_dependencies" to "service_role";

grant trigger on table "public"."module_dependencies" to "service_role";

grant truncate on table "public"."module_dependencies" to "service_role";

grant update on table "public"."module_dependencies" to "service_role";


  create policy "Module creators can add dependencies"
  on "public"."module_dependencies"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = module_dependencies.module_id) AND (c.creator_id = ( SELECT auth.uid() AS uid)) AND (c.is_module = true)))));



  create policy "Module creators can remove dependencies"
  on "public"."module_dependencies"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = module_dependencies.module_id) AND (c.creator_id = ( SELECT auth.uid() AS uid)) AND (c.is_module = true)))));



  create policy "Users can read module dependencies"
  on "public"."module_dependencies"
  as permissive
  for select
  to anon, authenticated
using (((EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = module_dependencies.module_id) AND (c.is_module = true) AND ((c.visibility = ANY (ARRAY['public'::public.campaign_visibility, 'purchasable'::public.campaign_visibility])) OR (EXISTS ( SELECT 1
           FROM public.user_modules um
          WHERE ((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid))))))))) AND (EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = module_dependencies.dependency_id) AND (c.is_module = true) AND ((c.visibility = ANY (ARRAY['public'::public.campaign_visibility, 'purchasable'::public.campaign_visibility])) OR (EXISTS ( SELECT 1
           FROM public.user_modules um
          WHERE ((um.module_id = c.id) AND (um.user_id = ( SELECT auth.uid() AS uid)))))))))));


CREATE TRIGGER enforce_module_dependency_is_module BEFORE INSERT OR UPDATE ON public.module_dependencies FOR EACH ROW EXECUTE FUNCTION public.validate_module_dependency_is_module();


