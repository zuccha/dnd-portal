set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_id uuid;
  r public.eldritch_invocations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.eldritch_invocations, p_eldritch_invocation);

  INSERT INTO public.eldritch_invocations (
    campaign_id, min_warlock_level, visibility
  ) VALUES (
    p_campaign_id, r.min_warlock_level, r.visibility
  )
  RETURNING id INTO v_id;

  perform public.upsert_eldritch_invocation_translation(v_id, p_lang, p_eldritch_invocation_translation);

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocation(p_id uuid)
 RETURNS record
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT
    e.id,
    e.campaign_id,
    c.name                                  AS campaign_name,
    e.min_warlock_level,
    coalesce(tt.name,         '{}'::jsonb)  AS name,
    coalesce(tt.prerequisite, '{}'::jsonb)  AS prerequisite,
    coalesce(tt.description,  '{}'::jsonb)  AS description,
    e.visibility
  FROM public.eldritch_invocations e
  JOIN public.campaigns c ON c.id = e.campaign_id
  LEFT JOIN (
    SELECT
      e.id,
      jsonb_object_agg(t.lang, t.name)         AS name,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description)  AS description
    FROM public.eldritch_invocations e
    LEFT JOIN public.eldritch_invocation_translations t on t.eldritch_invocation_id = e.id
    WHERE e.id = p_id
    GROUP BY e.id
  ) tt ON tt.id = e.id
  WHERE e.id = p_id;
$function$
;

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb DEFAULT '{}'::jsonb, p_order_by text DEFAULT 'name'::text, p_order_dir text DEFAULT 'asc'::text)
 RETURNS TABLE(id uuid, campaign_id uuid, campaign_name text, min_warlock_level smallint, name jsonb, prerequisite jsonb, description jsonb, visibility public.campaign_role)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
WITH prefs AS (
  SELECT coalesce( (p_filters->>'warlock_level')::int, 20 ) AS warlock_level
),
src AS (
  SELECT e.*
  FROM public.eldritch_invocations e
  JOIN public.campaigns c ON c.id = e.campaign_id
  WHERE e.campaign_id = p_campaign_id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE s.min_warlock_level <= p.warlock_level
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name)                                                                                 AS name,
    jsonb_object_agg(t.lang, t.prerequisite) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS prerequisite,
    jsonb_object_agg(t.lang, t.description)  FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS description
  FROM filtered f
  LEFT JOIN public.eldritch_invocation_translations t ON t.eldritch_invocation_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  c.name                                  AS campaign_name,
  f.min_warlock_level,
  coalesce(tt.name,         '{}'::jsonb)  AS name,
  coalesce(tt.prerequisite, '{}'::jsonb)  AS prerequisite,
  coalesce(tt.description,  '{}'::jsonb)  AS description,
  f.visibility
FROM filtered f
JOIN public.campaigns c ON c.id = f.campaign_id
LEFT JOIN t tt ON tt.id = f.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (tt.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (tt.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$function$
;

CREATE OR REPLACE FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.eldritch_invocations e
  SET (
    min_warlock_level, visibility
  ) = (
    SELECT r.min_warlock_level, r.visibility
    FROM jsonb_populate_record(null::public.eldritch_invocations, to_jsonb(e) || p_eldritch_invocation) AS r
  )
  WHERE e.id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_eldritch_invocation_translation(p_id, p_lang, p_eldritch_invocation_translation);
END;
$function$
;

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
    eldritch_invocation_id, lang, name, prerequisite, description
  ) VALUES (
    p_id, p_lang, r.name, r.prerequisite, r.description
  )
  ON conflict (eldritch_invocation_id, lang) DO UPDATE
  SET
    name = excluded.name,
    prerequisite = excluded.prerequisite,
    description = excluded.description;
END;
$function$
;


