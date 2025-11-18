drop policy "Players can read core campaigns" on "public"."campaigns";

drop policy "Players can read creatures from core campaigns" on "public"."creature_translations";

drop policy "Players can read creatures from core campaigns" on "public"."creatures";

drop policy "Players can read eldritch invocations from core campaigns" on "public"."eldritch_invocation_translations";

drop policy "Players can read eldritch invocations from core campaigns" on "public"."eldritch_invocations";

drop policy "Players can read spells from core campaigns" on "public"."spell_translations";

drop policy "Players can read spells from core campaigns" on "public"."spells";

drop policy "Players can read weapons from core campaigns" on "public"."weapon_translations";

drop policy "Players can read weapons from core campaigns" on "public"."weapons";

alter table "public"."campaigns" drop column "core";


  create policy "Players can read creatures from owned modules"
  on "public"."creature_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.creatures m
     JOIN public.campaigns c ON ((c.id = m.campaign_id)))
     JOIN public.user_modules um ON ((um.module_id = c.id)))
  WHERE ((m.id = creature_translations.creature_id) AND (c.is_module = true) AND (um.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Players can read creatures from public modules"
  on "public"."creature_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.creatures m
     JOIN public.campaigns c ON ((c.id = m.campaign_id)))
  WHERE ((m.id = creature_translations.creature_id) AND (c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)))));



  create policy "Players can read creatures from owned modules"
  on "public"."creatures"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.campaigns c
     JOIN public.user_modules um ON ((um.module_id = c.id)))
  WHERE ((c.id = creatures.campaign_id) AND (c.is_module = true) AND (um.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Players can read creatures from public modules"
  on "public"."creatures"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = creatures.campaign_id) AND (c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)))));



  create policy "Players can read eldritch invocations from owned modules"
  on "public"."eldritch_invocation_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.eldritch_invocations e
     JOIN public.campaigns c ON ((c.id = e.campaign_id)))
     JOIN public.user_modules um ON ((um.module_id = c.id)))
  WHERE ((e.id = eldritch_invocation_translations.eldritch_invocation_id) AND (c.is_module = true) AND (um.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Players can read eldritch invocations from public modules"
  on "public"."eldritch_invocation_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.eldritch_invocations e
     JOIN public.campaigns c ON ((c.id = e.campaign_id)))
  WHERE ((e.id = eldritch_invocation_translations.eldritch_invocation_id) AND (c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)))));



  create policy "Players can read eldritch invocations from owned modules"
  on "public"."eldritch_invocations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.campaigns c
     JOIN public.user_modules um ON ((um.module_id = c.id)))
  WHERE ((c.id = eldritch_invocations.campaign_id) AND (c.is_module = true) AND (um.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Players can read eldritch invocations from public modules"
  on "public"."eldritch_invocations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = eldritch_invocations.campaign_id) AND (c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)))));



  create policy "Players can read spells from owned modules"
  on "public"."spell_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.spells s
     JOIN public.campaigns c ON ((c.id = s.campaign_id)))
     JOIN public.user_modules um ON ((um.module_id = c.id)))
  WHERE ((s.id = spell_translations.spell_id) AND (c.is_module = true) AND (um.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Players can read spells from public modules"
  on "public"."spell_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.spells s
     JOIN public.campaigns c ON ((c.id = s.campaign_id)))
  WHERE ((s.id = spell_translations.spell_id) AND (c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)))));



  create policy "Players can read spells from owned modules"
  on "public"."spells"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.campaigns c
     JOIN public.user_modules um ON ((um.module_id = c.id)))
  WHERE ((c.id = spells.campaign_id) AND (c.is_module = true) AND (um.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Players can read spells from public modules"
  on "public"."spells"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = spells.campaign_id) AND (c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)))));



  create policy "Players can read weapons from owned modules"
  on "public"."weapon_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM ((public.weapons w
     JOIN public.campaigns c ON ((c.id = w.campaign_id)))
     JOIN public.user_modules um ON ((um.module_id = c.id)))
  WHERE ((w.id = weapon_translations.weapon_id) AND (c.is_module = true) AND (um.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Players can read weapons from public modules"
  on "public"."weapon_translations"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.weapons w
     JOIN public.campaigns c ON ((c.id = w.campaign_id)))
  WHERE ((w.id = weapon_translations.weapon_id) AND (c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)))));



  create policy "Players can read weapons from owned modules"
  on "public"."weapons"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.campaigns c
     JOIN public.user_modules um ON ((um.module_id = c.id)))
  WHERE ((c.id = weapons.campaign_id) AND (c.is_module = true) AND (um.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Players can read weapons from public modules"
  on "public"."weapons"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.campaigns c
  WHERE ((c.id = weapons.campaign_id) AND (c.is_module = true) AND (c.visibility = 'public'::public.campaign_visibility)))));



