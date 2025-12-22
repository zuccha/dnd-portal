set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  r public.eldritch_invocation_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.eldritch_invocation_translations, p_eldritch_invocation_translation);

  INSERT INTO public.eldritch_invocation_translations AS st (
    eldritch_invocation_id, lang, name, page, prerequisite, description
  ) VALUES (
    p_id, p_lang, r.name, r.page, r.prerequisite, r.description
  )
  ON conflict (eldritch_invocation_id, lang) DO UPDATE
  SET
    name = excluded.name,
    prerequisite = excluded.prerequisite,
    description = excluded.description;
END;
$function$
;


