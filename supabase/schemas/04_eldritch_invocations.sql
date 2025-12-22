--------------------------------------------------------------------------------
-- ELDRITCH INVOCATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.eldritch_invocations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  campaign_id uuid NOT NULL,
  min_warlock_level smallint NOT NULL,
  visibility public.campaign_role DEFAULT 'game_master'::public.campaign_role NOT NULL,
  CONSTRAINT eldritch_invocations_pkey PRIMARY KEY (id),
  CONSTRAINT eldritch_invocations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT eldritch_invocations_min_warlock_level_check CHECK (((min_warlock_level >= 0) AND (min_warlock_level <= 20)))
);

ALTER TABLE public.eldritch_invocations OWNER TO postgres;
ALTER TABLE public.eldritch_invocations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.eldritch_invocations TO anon;
GRANT ALL ON TABLE public.eldritch_invocations TO authenticated;
GRANT ALL ON TABLE public.eldritch_invocations TO service_role;


--------------------------------------------------------------------------------
-- ELDRITCH INVOCATION TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.eldritch_invocation_translations (
  eldritch_invocation_id uuid DEFAULT gen_random_uuid() NOT NULL,
  lang text DEFAULT ''::text NOT NULL,
  name text DEFAULT ''::text NOT NULL,
  prerequisite text,
  description text DEFAULT ''::text NOT NULL,
  page smallint,
  CONSTRAINT eldritch_invocation_translations_pkey PRIMARY KEY (eldritch_invocation_id, lang),
  CONSTRAINT eldritch_invocation_translations_eldritch_invocation_id_fkey FOREIGN KEY (eldritch_invocation_id) REFERENCES public.eldritch_invocations(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT eldritch_invocation_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.eldritch_invocation_translations OWNER TO postgres;
ALTER TABLE public.eldritch_invocation_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.eldritch_invocation_translations TO anon;
GRANT ALL ON TABLE public.eldritch_invocation_translations TO authenticated;
GRANT ALL ON TABLE public.eldritch_invocation_translations TO service_role;


--------------------------------------------------------------------------------
-- CAN READ ELDRITCH INVOCATION TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT can_read_campaign_resource(ei.campaign_id, ei.visibility)
  FROM public.eldritch_invocations ei
  WHERE ei.id = p_eldritch_invocation_id;
$$;

ALTER FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN EDIT ELDRITCH INVOCATION TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT can_edit_campaign_resource(ei.campaign_id)
  FROM public.eldritch_invocations ei
  WHERE ei.id = p_eldritch_invocation_id;
$$;

ALTER FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_edit_eldritch_invocation_translation(p_eldritch_invocation_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- ELDRITCH INVOCATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read eldritch invocations"
ON public.eldritch_invocations
FOR SELECT TO authenticated
USING (public.can_read_campaign_resource(campaign_id, visibility) OR public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can create new eldritch invocations"
ON public.eldritch_invocations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can update eldritch invocations"
ON public.eldritch_invocations
FOR UPDATE TO authenticated
USING (public.can_edit_campaign_resource(campaign_id))
WITH CHECK (public.can_edit_campaign_resource(campaign_id));

CREATE POLICY "Creators and GMs can delete eldritch invocations"
ON public.eldritch_invocations
FOR DELETE TO authenticated
USING (public.can_edit_campaign_resource(campaign_id));


--------------------------------------------------------------------------------
-- ELDRITCH INVOCATION TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR SELECT TO authenticated
USING (public.can_read_eldritch_invocation_translation(eldritch_invocation_id) OR public.can_edit_eldritch_invocation_translation(eldritch_invocation_id));

CREATE POLICY "Creators and GMs can create new eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_eldritch_invocation_translation(eldritch_invocation_id));

CREATE POLICY "Creators and GMs can update eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR UPDATE TO authenticated
USING (public.can_edit_eldritch_invocation_translation(eldritch_invocation_id))
WITH CHECK (public.can_edit_eldritch_invocation_translation(eldritch_invocation_id));

CREATE POLICY "Creators and GMs can delete eldritch invocation translations"
ON public.eldritch_invocation_translations
FOR DELETE TO authenticated
USING (public.can_edit_eldritch_invocation_translation(eldritch_invocation_id));


--------------------------------------------------------------------------------
-- CREATE ELDRITCH INVOCATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_eldritch_invocation(
  p_campaign_id uuid,
  p_lang text,
  p_eldritch_invocation jsonb,
  p_eldritch_invocation_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

ALTER FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_eldritch_invocation(p_campaign_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ELDRITCH INVOCATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocation(p_id uuid)
RETURNS record
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.id,
    e.campaign_id,
    c.name                                  AS campaign_name,
    e.min_warlock_level,
    coalesce(tt.name,         '{}'::jsonb)  AS name,
    coalesce(tt.page,         '{}'::jsonb)  AS page,
    coalesce(tt.prerequisite, '{}'::jsonb)  AS prerequisite,
    coalesce(tt.description,  '{}'::jsonb)  AS description,
    e.visibility
  FROM public.eldritch_invocations e
  JOIN public.campaigns c ON c.id = e.campaign_id
  LEFT JOIN (
    SELECT
      e.id,
      jsonb_object_agg(t.lang, t.name)         AS name,
      jsonb_object_agg(t.lang, t.page)         AS page,
      jsonb_object_agg(t.lang, t.prerequisite) AS prerequisite,
      jsonb_object_agg(t.lang, t.description)  AS description
    FROM public.eldritch_invocations e
    LEFT JOIN public.eldritch_invocation_translations t on t.eldritch_invocation_id = e.id
    WHERE e.id = p_id
    GROUP BY e.id
  ) tt ON tt.id = e.id
  WHERE e.id = p_id;
$$;

ALTER FUNCTION public.fetch_eldritch_invocation(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_eldritch_invocation(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocation(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocation(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ELDRITCH INVOCATIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_eldritch_invocations(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS TABLE(
  id uuid,
  campaign_id uuid,
  campaign_name text,
  min_warlock_level smallint,
  name jsonb,
  page jsonb,
  prerequisite jsonb,
  description jsonb,
  visibility public.campaign_role)
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    coalesce(p_filters->'campaigns', '{}'::jsonb) AS campaign_filter,
    coalesce((p_filters->>'warlock_level')::int, 20) AS warlock_level
),
src AS (
  SELECT e.*
  FROM public.eldritch_invocations e
  JOIN prefs p ON true
  JOIN public.campaign_resource_ids(p_campaign_id, p.campaign_filter) ci ON ci.id = e.campaign_id
  JOIN public.campaigns c ON c.id = e.campaign_id
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
    jsonb_object_agg(t.lang, t.page)         FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS page,
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
  coalesce(tt.page,         '{}'::jsonb)  AS page,
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
$$;

ALTER FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_eldritch_invocations(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT ELDRITCH INVOCATION TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_eldritch_invocation_translation(
  p_id uuid,
  p_lang text,
  p_eldritch_invocation_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
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
    page = excluded.page,
    prerequisite = excluded.prerequisite,
    description = excluded.description;
END;
$$;

ALTER FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_eldritch_invocation_translation(p_id uuid, p_lang text, p_eldritch_invocation_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE ELDRITCH INVOCATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_eldritch_invocation(
  p_id uuid,
  p_lang text,
  p_eldritch_invocation jsonb,
  p_eldritch_invocation_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
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
$$;

ALTER FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_eldritch_invocation(p_id uuid, p_lang text, p_eldritch_invocation jsonb, p_eldritch_invocation_translation jsonb) TO service_role;
