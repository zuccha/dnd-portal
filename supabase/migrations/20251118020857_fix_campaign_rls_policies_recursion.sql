drop policy "Creators and GMs can edit campaigns" on "public"."campaigns";

drop policy "Campaign creators can manage memberships" on "public"."campaign_players";

drop policy "Module creators can manage ownership" on "public"."user_modules";


  create policy "Campaign creators can edit"
  on "public"."campaigns"
  as permissive
  for all
  to authenticated
using ((creator_id = ( SELECT auth.uid() AS uid)));



  create policy "Campaign creators can manage memberships"
  on "public"."campaign_players"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = campaign_players.campaign_id) AND (c.creator_id = ( SELECT auth.uid() AS uid))))));



  create policy "Module creators can manage ownership"
  on "public"."user_modules"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = user_modules.module_id) AND (c.creator_id = ( SELECT auth.uid() AS uid)) AND (c.is_module = true)))));



