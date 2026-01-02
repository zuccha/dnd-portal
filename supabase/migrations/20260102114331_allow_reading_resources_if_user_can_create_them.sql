drop policy "Users can read resources" on "public"."resources";


  create policy "Users can read resources"
  on "public"."resources"
  as permissive
  for select
  to anon, authenticated
using ((public.can_read_resource(id) OR public.can_edit_resource(id) OR public.can_create_resource(campaign_id)));



