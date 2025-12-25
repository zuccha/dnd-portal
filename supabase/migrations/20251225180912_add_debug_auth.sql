drop policy "Creators and GMs can create new equipment translations" on "public"."equipment_translations";

drop policy "Creators and GMs can create new equipments" on "public"."equipments";

drop policy "Creators and GMs can create new item translations" on "public"."item_translations";

drop policy "Creators and GMs can create new items" on "public"."items";

drop policy "Creators and GMs can create new resource translations" on "public"."resource_translations";

drop policy "Creators and GMs can create new resources" on "public"."resources";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.debug_auth()
 RETURNS jsonb
 LANGUAGE sql
AS $function$
  SELECT jsonb_build_object(
    'uid', auth.uid(),
    'role', current_setting('request.jwt.claim.role', true)
  );
$function$
;


  create policy "Creators and GMs can create new equipment translations"
  on "public"."equipment_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can create new equipments"
  on "public"."equipments"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can create new item translations"
  on "public"."item_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can create new items"
  on "public"."items"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can create new resource translations"
  on "public"."resource_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_resource(resource_id));



  create policy "Creators and GMs can create new resources"
  on "public"."resources"
  as permissive
  for insert
  to authenticated
with check (public.can_create_resource(campaign_id));



