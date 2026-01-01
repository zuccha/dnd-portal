drop policy "Users can read armor translations" on "public"."armor_translations";

drop policy "Users can read armors" on "public"."armors";

drop policy "Users can read creature translations" on "public"."creature_translations";

drop policy "Users can read creatures" on "public"."creatures";

drop policy "Users can read eldritch invocation translations" on "public"."eldritch_invocation_translations";

drop policy "Users can read eldritch invocations" on "public"."eldritch_invocations";

drop policy "Users can read equipment translations" on "public"."equipment_translations";

drop policy "Users can read equipments" on "public"."equipments";

drop policy "Users can read item translations" on "public"."item_translations";

drop policy "Users can read items" on "public"."items";

drop policy "Users can read resource translations" on "public"."resource_translations";

drop policy "Users can read resources" on "public"."resources";

drop policy "Users can read spell translations" on "public"."spell_translations";

drop policy "Users can read spells" on "public"."spells";

drop policy "Users can read tool translations" on "public"."tool_translations";

drop policy "Users can read tools" on "public"."tools";

drop policy "Users can read weapon translations" on "public"."weapon_translations";

drop policy "Users can read weapons" on "public"."weapons";


  create policy "Anon can read public/purchasable modules"
  on "public"."campaigns"
  as permissive
  for select
  to anon
using (((is_module = true) AND (visibility = ANY (ARRAY['public'::public.campaign_visibility, 'purchasable'::public.campaign_visibility]))));



  create policy "Users can read armor translations"
  on "public"."armor_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read armors"
  on "public"."armors"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read creature translations"
  on "public"."creature_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read creatures"
  on "public"."creatures"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read eldritch invocation translations"
  on "public"."eldritch_invocation_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read equipment translations"
  on "public"."equipment_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read equipments"
  on "public"."equipments"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read item translations"
  on "public"."item_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read items"
  on "public"."items"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read resource translations"
  on "public"."resource_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read resources"
  on "public"."resources"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(id));



  create policy "Users can read spell translations"
  on "public"."spell_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read spells"
  on "public"."spells"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read tool translations"
  on "public"."tool_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read tools"
  on "public"."tools"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read weapon translations"
  on "public"."weapon_translations"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



  create policy "Users can read weapons"
  on "public"."weapons"
  as permissive
  for select
  to anon, authenticated
using (public.can_read_resource(resource_id));



