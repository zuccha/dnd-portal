drop policy "Creators and GMs can edit creature translations" on "public"."creature_translations";

drop policy "Creators and GMs can edit creatures" on "public"."creatures";

drop policy "Creators and GMs can edit eldritch invocation translations" on "public"."eldritch_invocation_translations";

drop policy "Creators and GMs can edit eldritch invocations" on "public"."eldritch_invocations";

drop policy "Creators and GMs can edit spell translations" on "public"."spell_translations";

drop policy "Creators and GMs can edit spells" on "public"."spells";

drop policy "Creators and GMs can edit weapon translations" on "public"."weapon_translations";

drop policy "Creators and GMs can edit weapons" on "public"."weapons";

drop policy "Users can read creature translations" on "public"."creature_translations";

drop policy "Users can read creatures" on "public"."creatures";

drop policy "Users can read eldritch invocation translations" on "public"."eldritch_invocation_translations";

drop policy "Users can read eldritch invocations" on "public"."eldritch_invocations";

drop policy "Users can read spell translations" on "public"."spell_translations";

drop policy "Users can read spells" on "public"."spells";

drop policy "Users can read weapon translations" on "public"."weapon_translations";

drop policy "Users can read weapons" on "public"."weapons";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.can_edit_creature(p_campaign_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
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
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_creature_translation(p_creature_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  SELECT can_edit_creature(cr.campaign_id)
  FROM public.creatures cr
  WHERE cr.id = p_creature_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_eldritch_invocation(p_campaign_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid) AND um.role = 'creator'::public.module_role)
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() as uid) AND cp.role = 'game_master'::public.campaign_role)
    WHERE c.id = p_campaign_id
      AND (
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  SELECT can_edit_eldritch_invocation(ei.campaign_id)
  FROM public.eldritch_invocations ei
  WHERE ei.id = p_eldritch_invocation_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_spell(p_campaign_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid) AND um.role = 'creator'::public.module_role)
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() as uid) AND cp.role = 'game_master'::public.campaign_role)
    WHERE c.id = p_campaign_id
      AND (
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_spell_translation(p_spell_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  SELECT can_edit_spell(s.campaign_id)
  FROM public.spells s
  WHERE s.id = p_spell_id;
END
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_weapon(p_campaign_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid) AND um.role = 'creator'::public.module_role)
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() as uid) AND cp.role = 'game_master'::public.campaign_role)
    WHERE c.id = p_campaign_id
      AND (
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_weapon_translation(p_weapon_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  SELECT can_edit_weapon(w.campaign_id)
  FROM public.weapons w
  WHERE w.id = p_weapon_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_creature(p_campaign_id uuid, p_creature_visibility public.campaign_role)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid))
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() AS uid))
    WHERE c.id = p_campaign_id
      AND (
        -- Public modules
        (c.is_module = true AND c.visibility = 'public'::public.campaign_visibility)
        OR
        -- Owned modules
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        -- Non-module campaigns with visibility check
        (c.is_module = false AND cp.user_id IS NOT NULL AND (
          p_creature_visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_creature_translation(p_creature_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN;
  SELECT can_read_creature(cr.campaign_id, cr.visibility)
  FROM public.creatures cr
  WHERE cr.id = p_creature_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_eldritch_invocation(p_campaign_id uuid, p_eldritch_invocation_visibility public.campaign_role)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
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
          p_eldritch_invocation_visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  SELECT can_read_eldritch_invocation(ei.campaign_id, ei.visibility)
  FROM public.eldritch_invocations ei
  WHERE ei.id = p_eldritch_invocation_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_spell(p_campaign_id uuid, p_spell_visibility public.campaign_role)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
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
          p_spell_visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_spell_translation(p_spell_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  SELECT can_read_spell(s.campaign_id, s.visibility)
  FROM public.spells s
  WHERE s.id = p_spell_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_weapon(p_campaign_id uuid, p_weapon_visibility public.campaign_role)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
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
          p_weapon_visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_read_weapon_translation(p_weapon_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  SELECT can_read_weapon(w.campaign_id, w.visibility)
  FROM public.weapons w
  WHERE w.id = p_weapon_id;
END;
$function$
;


  create policy "Creators and GMs can create new creature translations"
  on "public"."creature_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_creature_translation(creature_id));



  create policy "Creators and GMs can delete creature translations"
  on "public"."creature_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_creature_translation(creature_id));



  create policy "Creators and GMs can update creature translations"
  on "public"."creature_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_creature_translation(creature_id))
with check (public.can_edit_creature_translation(creature_id));



  create policy "Creators and GMs can create new creatures"
  on "public"."creatures"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_creature(campaign_id));



  create policy "Creators and GMs can delete creatures"
  on "public"."creatures"
  as permissive
  for delete
  to authenticated
using (public.can_edit_creature(campaign_id));



  create policy "Creators and GMs can update creatures"
  on "public"."creatures"
  as permissive
  for update
  to authenticated
using (public.can_edit_creature(campaign_id))
with check (public.can_edit_creature(campaign_id));



  create policy "Creators and GMs can create new eldritch invocation translation"
  on "public"."eldritch_invocation_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_eldritch_invocation_translation(eldritch_invocation_id));



  create policy "Creators and GMs can delete eldritch invocation translations"
  on "public"."eldritch_invocation_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_eldritch_invocation_translation(eldritch_invocation_id));



  create policy "Creators and GMs can update eldritch invocation translations"
  on "public"."eldritch_invocation_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_eldritch_invocation_translation(eldritch_invocation_id))
with check (public.can_edit_eldritch_invocation_translation(eldritch_invocation_id));



  create policy "Creators and GMs can create new eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_eldritch_invocation(campaign_id));



  create policy "Creators and GMs can delete eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_eldritch_invocation(campaign_id));



  create policy "Creators and GMs can update eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for update
  to authenticated
using (public.can_edit_eldritch_invocation(campaign_id))
with check (public.can_edit_eldritch_invocation(campaign_id));



  create policy "Creators and GMs can create new spell translations"
  on "public"."spell_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_spell_translation(spell_id));



  create policy "Creators and GMs can delete spell translations"
  on "public"."spell_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_spell_translation(spell_id));



  create policy "Creators and GMs can update spell translations"
  on "public"."spell_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_spell_translation(spell_id))
with check (public.can_edit_spell_translation(spell_id));



  create policy "Creators and GMs can create new spells"
  on "public"."spells"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_spell(campaign_id));



  create policy "Creators and GMs can delete spells"
  on "public"."spells"
  as permissive
  for delete
  to authenticated
using (public.can_edit_spell(campaign_id));



  create policy "Creators and GMs can update spells"
  on "public"."spells"
  as permissive
  for update
  to authenticated
using (public.can_edit_spell(campaign_id))
with check (public.can_edit_spell(campaign_id));



  create policy "Creators and GMs can create new weapon translations"
  on "public"."weapon_translations"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_weapon_translation(weapon_id));



  create policy "Creators and GMs can delete weapon translations"
  on "public"."weapon_translations"
  as permissive
  for delete
  to authenticated
using (public.can_edit_weapon_translation(weapon_id));



  create policy "Creators and GMs can update weapon translations"
  on "public"."weapon_translations"
  as permissive
  for update
  to authenticated
using (public.can_edit_weapon_translation(weapon_id))
with check (public.can_edit_weapon_translation(weapon_id));



  create policy "Creators and GMs can create new weapons"
  on "public"."weapons"
  as permissive
  for insert
  to authenticated
with check (public.can_edit_weapon(campaign_id));



  create policy "Creators and GMs can delete weapons"
  on "public"."weapons"
  as permissive
  for delete
  to authenticated
using (public.can_edit_weapon(campaign_id));



  create policy "Creators and GMs can update weapons"
  on "public"."weapons"
  as permissive
  for update
  to authenticated
using (public.can_edit_weapon(campaign_id))
with check (public.can_edit_weapon(campaign_id));



  create policy "Users can read creature translations"
  on "public"."creature_translations"
  as permissive
  for select
  to authenticated
using ((public.can_read_creature_translation(creature_id) OR public.can_edit_creature_translation(creature_id)));



  create policy "Users can read creatures"
  on "public"."creatures"
  as permissive
  for select
  to authenticated
using ((public.can_read_creature(campaign_id, visibility) OR public.can_edit_creature(campaign_id)));



  create policy "Users can read eldritch invocation translations"
  on "public"."eldritch_invocation_translations"
  as permissive
  for select
  to authenticated
using ((public.can_read_eldritch_invocation_translation(eldritch_invocation_id) OR public.can_edit_eldritch_invocation_translation(eldritch_invocation_id)));



  create policy "Users can read eldritch invocations"
  on "public"."eldritch_invocations"
  as permissive
  for select
  to authenticated
using ((public.can_read_eldritch_invocation(campaign_id, visibility) OR public.can_edit_eldritch_invocation(campaign_id)));



  create policy "Users can read spell translations"
  on "public"."spell_translations"
  as permissive
  for select
  to authenticated
using ((public.can_read_spell_translation(spell_id) OR public.can_edit_spell_translation(spell_id)));



  create policy "Users can read spells"
  on "public"."spells"
  as permissive
  for select
  to authenticated
using ((public.can_read_spell(campaign_id, visibility) OR public.can_edit_spell(campaign_id)));



  create policy "Users can read weapon translations"
  on "public"."weapon_translations"
  as permissive
  for select
  to authenticated
using ((public.can_read_weapon_translation(weapon_id) OR public.can_edit_weapon_translation(weapon_id)));



  create policy "Users can read weapons"
  on "public"."weapons"
  as permissive
  for select
  to authenticated
using ((public.can_read_weapon(campaign_id, visibility) OR public.can_edit_weapon(campaign_id)));



