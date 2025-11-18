drop policy "Creators and GMs can create new creatures" on "public"."creatures";

drop policy "Creators and GMs can delete creatures" on "public"."creatures";

drop policy "Creators and GMs can update creatures" on "public"."creatures";

drop policy "Users can read creatures" on "public"."creatures";

drop policy "Creators and GMs can create new eldritch invocations" on "public"."eldritch_invocations";

drop policy "Creators and GMs can delete eldritch invocations" on "public"."eldritch_invocations";

drop policy "Creators and GMs can update eldritch invocations" on "public"."eldritch_invocations";

drop policy "Users can read eldritch invocations" on "public"."eldritch_invocations";

drop policy "Creators and GMs can create new spells" on "public"."spells";

drop policy "Creators and GMs can delete spells" on "public"."spells";

drop policy "Creators and GMs can update spells" on "public"."spells";

drop policy "Users can read spells" on "public"."spells";

drop policy "Creators and GMs can create new weapons" on "public"."weapons";

drop policy "Creators and GMs can delete weapons" on "public"."weapons";

drop policy "Creators and GMs can update weapons" on "public"."weapons";

drop policy "Users can read weapons" on "public"."weapons";

drop function if exists "public"."can_edit_creature"(p_campaign_id uuid);

drop function if exists "public"."can_edit_eldritch_invocation"(p_campaign_id uuid);

drop function if exists "public"."can_edit_spell"(p_campaign_id uuid);

drop function if exists "public"."can_edit_weapon"(p_campaign_id uuid);

drop function if exists "public"."can_read_creature"(p_campaign_id uuid, p_creature_visibility public.campaign_role);

drop function if exists "public"."can_read_eldritch_invocation"(p_campaign_id uuid, p_eldritch_invocation_visibility public.campaign_role);

drop function if exists "public"."can_read_spell"(p_campaign_id uuid, p_spell_visibility public.campaign_role);

drop function if exists "public"."can_read_weapon"(p_campaign_id uuid, p_weapon_visibility public.campaign_role);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_edit_campaign_resource(p_campaign_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid) AND um.role = 'creator'::public.module_role)
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() as uid) AND cp.role = 'game_master'::public.campaign_role)
    WHERE c.id = p_campaign_id
      AND (
        -- Module creators
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        -- Campaign GMs
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_campaign_resource(p_campaign_id uuid, p_resource_visibility public.campaign_role)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid))
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() AS uid))
    WHERE c.id = p_campaign_id
      AND (
        (c.is_module = true AND c.visibility = 'public'::public.campaign_visibility)
        OR
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        (c.is_module = false AND cp.user_id IS NOT NULL AND (
          p_resource_visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_module_role(p_module_id uuid)
 RETURNS public.module_role
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select um.role
  from public.user_modules um
  where um.module_id = p_module_id
    and um.user_id = auth.uid()
  limit 1;
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_creature_translation(p_creature_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT can_edit_campaign_resource(cr.campaign_id)
  FROM public.creatures cr
  WHERE cr.id = p_creature_id;
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT can_edit_campaign_resource(ei.campaign_id)
  FROM public.eldritch_invocations ei
  WHERE ei.id = p_eldritch_invocation_id;
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_spell_translation(p_spell_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT can_edit_campaign_resource(s.campaign_id)
  FROM public.spells s
  WHERE s.id = p_spell_id;
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_weapon_translation(p_weapon_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT can_edit_campaign_resource(w.campaign_id)
  FROM public.weapons w
  WHERE w.id = p_weapon_id;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_creature_translation(p_creature_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT can_read_campaign_resource(cr.campaign_id, cr.visibility)
  FROM public.creatures cr
  WHERE cr.id = p_creature_id;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT can_read_campaign_resource(ei.campaign_id, ei.visibility)
  FROM public.eldritch_invocations ei
  WHERE ei.id = p_eldritch_invocation_id;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_spell_translation(p_spell_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT can_read_campaign_resource(s.campaign_id, s.visibility)
  FROM public.spells s
  WHERE s.id = p_spell_id;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_weapon_translation(p_weapon_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT can_read_campaign_resource(w.campaign_id, w.visibility)
  FROM public.weapons w
  WHERE w.id = p_weapon_id;
$function$
;


  create policy "Creators and GMs can create new creatures"
  on "public"."creatures"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_campaign_resource(campaign_id));



  create policy "Creators and GMs can delete creatures"
  on "public"."creatures"
  as permissive
  for delete
  to authenticated
using (public.can_edit_campaign_resource(campaign_id));



  create policy "Creators and GMs can update creatures"
  on "public"."creatures"
  as permissive
  for update
  to authenticated
using (public.can_edit_campaign_resource(campaign_id))
with check (public.can_edit_campaign_resource(campaign_id));



  create policy "Users can read creatures"
  on "public"."creatures"
  as permissive
  for select
  to authenticated
using ((public.can_read_campaign_resource(campaign_id, visibility) OR public.can_edit_campaign_resource(campaign_id)));



  create policy "Creators and GMs can create new eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_campaign_resource(campaign_id));



  create policy "Creators and GMs can delete eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_campaign_resource(campaign_id));



  create policy "Creators and GMs can update eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for update
  to authenticated
using (public.can_edit_campaign_resource(campaign_id))
with check (public.can_edit_campaign_resource(campaign_id));



  create policy "Users can read eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for select
  to authenticated
using ((public.can_read_campaign_resource(campaign_id, visibility) OR public.can_edit_campaign_resource(campaign_id)));



  create policy "Creators and GMs can create new spells"
  on "public"."spells"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_campaign_resource(campaign_id));



  create policy "Creators and GMs can delete spells"
  on "public"."spells"
  as permissive
  for delete
  to authenticated
using (public.can_edit_campaign_resource(campaign_id));



  create policy "Creators and GMs can update spells"
  on "public"."spells"
  as permissive
  for update
  to authenticated
using (public.can_edit_campaign_resource(campaign_id))
with check (public.can_edit_campaign_resource(campaign_id));



  create policy "Users can read spells"
  on "public"."spells"
  as permissive
  for select
  to authenticated
using ((public.can_read_campaign_resource(campaign_id, visibility) OR public.can_edit_campaign_resource(campaign_id)));



  create policy "Creators and GMs can create new weapons"
  on "public"."weapons"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_campaign_resource(campaign_id));



  create policy "Creators and GMs can delete weapons"
  on "public"."weapons"
  as permissive
  for delete
  to authenticated
using (public.can_edit_campaign_resource(campaign_id));



  create policy "Creators and GMs can update weapons"
  on "public"."weapons"
  as permissive
  for update
  to authenticated
using (public.can_edit_campaign_resource(campaign_id))
with check (public.can_edit_campaign_resource(campaign_id));



  create policy "Users can read weapons"
  on "public"."weapons"
  as permissive
  for select
  to authenticated
using ((public.can_read_campaign_resource(campaign_id, visibility) OR public.can_edit_campaign_resource(campaign_id)));



