--------------------------------------------------------------------------------
-- RESOURCES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.resources (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  campaign_id uuid NOT NULL,
  visibility public.campaign_role DEFAULT 'game_master'::public.campaign_role NOT NULL,
  kind public.resource_kind NOT NULL,
  CONSTRAINT resources_pkey PRIMARY KEY (id),
  CONSTRAINT resources_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.resources OWNER TO postgres;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.resources TO anon;
GRANT ALL ON TABLE public.resources TO authenticated;
GRANT ALL ON TABLE public.resources TO service_role;


--------------------------------------------------------------------------------
-- RESOURCE TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.resource_translations (
  resource_id uuid DEFAULT gen_random_uuid() NOT NULL,
  lang text NOT NULL,
  name text DEFAULT ''::text NOT NULL,
  page smallint,
  CONSTRAINT resource_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT resource_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT resource_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.resource_translations OWNER TO postgres;
ALTER TABLE public.resource_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.resource_translations TO anon;
GRANT ALL ON TABLE public.resource_translations TO authenticated;
GRANT ALL ON TABLE public.resource_translations TO service_role;


--------------------------------------------------------------------------------
-- RESOURCE ROW
--------------------------------------------------------------------------------

CREATE TYPE public.resource_row AS (
  id uuid,
  campaign_id uuid,
  campaign_name text,
  kind public.resource_kind,
  visibility public.campaign_role,
  name jsonb,
  page jsonb
);


--------------------------------------------------------------------------------
-- CAN READ RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_resource(p_resource_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.resources r
    JOIN public.campaigns c ON c.id = r.campaign_id
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid))
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() AS uid))
    WHERE r.id = p_resource_id
      AND (
        (c.is_module = true AND c.visibility = 'public'::public.campaign_visibility)
        OR
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        (c.is_module = false AND cp.user_id IS NOT NULL AND (
          r.visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  );
$$;

ALTER FUNCTION public.can_read_resource(p_resource_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_resource(p_resource_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_read_resource(p_resource_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_resource(p_resource_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN EDIT RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_edit_resource(p_resource_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.resources r
    JOIN public.campaigns c ON c.id = r.campaign_id
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid) AND um.role = 'creator'::public.module_role)
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() as uid) AND cp.role = 'game_master'::public.campaign_role)
    WHERE r.id = p_resource_id
      AND (
        -- Module creators
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        -- Campaign GMs
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  );
$$;

ALTER FUNCTION public.can_edit_resource(p_resource_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_edit_resource(p_resource_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_edit_resource(p_resource_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_edit_resource(p_resource_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- CAN CREATE RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_create_resource(p_campaign_id uuid)
RETURNS boolean
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (
      um.module_id = c.id
      AND um.user_id = (SELECT auth.uid() AS uid)
      AND um.role = 'creator'::public.module_role
    )
    LEFT JOIN public.campaign_players cp ON (
      cp.campaign_id = c.id
      AND cp.user_id = (SELECT auth.uid() AS uid)
      AND cp.role = 'game_master'::public.campaign_role
    )
    WHERE c.id = p_campaign_id
      AND (
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  );
$$;

ALTER FUNCTION public.can_create_resource(p_campaign_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_create_resource(p_campaign_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_create_resource(p_campaign_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_create_resource(p_campaign_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- RESOURCES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read resources"
ON public.resources
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(id)
  OR public.can_edit_resource(id)
  OR public.can_create_resource(campaign_id)
);

CREATE POLICY "Creators and GMs can create new resources"
ON public.resources
FOR INSERT TO authenticated
WITH CHECK (public.can_create_resource(campaign_id));

CREATE POLICY "Creators and GMs can update resources"
ON public.resources
FOR UPDATE TO authenticated
USING (public.can_edit_resource(id))
WITH CHECK (public.can_edit_resource(id));

CREATE POLICY "Creators and GMs can delete resources"
ON public.resources
FOR DELETE TO authenticated
USING (public.can_edit_resource(id));


--------------------------------------------------------------------------------
-- RESOURCE TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read resource translations"
ON public.resource_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new resource translations"
ON public.resource_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update resource translations"
ON public.resource_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete resource translations"
ON public.resource_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- CREATE RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_resource(
  p_campaign_id uuid,
  p_lang text,
  p_resource jsonb,
  p_resource_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.resources%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.resources, p_resource);

  INSERT INTO public.resources (
    campaign_id, visibility, kind
  ) VALUES (
    p_campaign_id, r.visibility, r.kind
  )
  RETURNING id INTO v_id;

  perform public.upsert_resource_translation(v_id, p_lang, p_resource_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_resource(p_campaign_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_resource(p_campaign_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_resource(p_campaign_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_resource(p_campaign_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_resource(p_id uuid)
RETURNS public.resource_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.id,
    r.campaign_id,
    c.name                          AS campaign_name,
    r.kind,
    r.visibility,
    coalesce(tt.name, '{}'::jsonb)  AS name,
    coalesce(tt.page, '{}'::jsonb)  AS page
  FROM public.resources r
  JOIN public.campaigns c ON c.id = r.campaign_id
  LEFT JOIN (
    SELECT
      r.id,
      jsonb_object_agg(t.lang, t.name) AS name,
      jsonb_object_agg(t.lang, t.page) AS page
    FROM public.resources r
    LEFT JOIN public.resource_translations t ON t.resource_id = r.id
    WHERE r.id = p_id
    GROUP BY r.id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_resource(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_resource(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_resource(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_resource(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH RESOURCES
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_resources(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.resource_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- campaign/modules include/exclude filter (keys are campaign or module ids)
    coalesce(p_filters->'campaigns', '{}'::jsonb) AS campaign_filter,

    -- kinds
    (
      SELECT coalesce(array_agg(lower(e.key)::public.resource_kind), null)
      FROM jsonb_each_text(p_filters->'kinds') AS e(key, value)
      WHERE e.value = 'true'
    ) AS kinds_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.resource_kind), null)
      FROM jsonb_each_text(p_filters->'kinds') AS e(key, value)
      WHERE e.value = 'false'
    ) AS kinds_exc
),
src AS (
  SELECT r.*
  FROM public.resources r
  JOIN prefs p ON true
  JOIN public.campaign_resource_ids(p_campaign_id, p.campaign_filter) ci ON ci.id = r.campaign_id
  JOIN public.campaigns c ON c.id = r.campaign_id
),
filtered AS (
  SELECT r.*
  FROM src r, prefs p
  WHERE
    (p.kinds_inc IS NULL OR r.kind = any(p.kinds_inc))
    AND (p.kinds_exc IS NULL OR NOT (r.kind = any(p.kinds_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.name) AS name,
    jsonb_object_agg(t.lang, t.page) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS page
  FROM filtered f
  LEFT JOIN public.resource_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.id,
  f.campaign_id,
  c.name                        AS campaign_name,
  f.kind,
  f.visibility,
  coalesce(tt.name, '{}'::jsonb) AS name,
  coalesce(tt.page, '{}'::jsonb) AS page
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

ALTER FUNCTION public.fetch_resources(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_resources(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_resources(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_resources(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- FETCH RESOURCE OPTIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_resource_options(
  p_campaign_id uuid,
  p_resource_kinds public.resource_kind[])
RETURNS TABLE(id uuid, name jsonb)
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  WITH campaign_ids AS (
    SELECT p_campaign_id AS id
    UNION
    SELECT cm.module_id
    FROM public.campaign_modules cm
    WHERE cm.campaign_id = p_campaign_id
  )
  SELECT
    r.id,
    coalesce(tt.name, '{}'::jsonb) AS name
  FROM public.resources r
  JOIN campaign_ids cids ON cids.id = r.campaign_id
  LEFT JOIN (
    SELECT
      rt.resource_id AS id,
      jsonb_object_agg(rt.lang, rt.name) AS name
    FROM public.resource_translations rt
    GROUP BY rt.resource_id
  ) tt ON tt.id = r.id
  WHERE r.kind = any(p_resource_kinds)
  ORDER BY r.id;
$$;

ALTER FUNCTION public.fetch_resource_options(p_campaign_id uuid, p_resource_kinds public.resource_kind[]) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_resource_options(p_campaign_id uuid, p_resource_kinds public.resource_kind[]) TO anon;
GRANT ALL ON FUNCTION public.fetch_resource_options(p_campaign_id uuid, p_resource_kinds public.resource_kind[]) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_resource_options(p_campaign_id uuid, p_resource_kinds public.resource_kind[]) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT RESOURCE TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_resource_translation(
  p_id uuid,
  p_lang text,
  p_resource_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.resource_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.resource_translations, p_resource_translation);

  INSERT INTO public.resource_translations AS rt (
    resource_id, lang, name, page
  ) VALUES (
    p_id, p_lang, r.name, r.page
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    name = excluded.name,
    page = excluded.page;
END;
$$;

ALTER FUNCTION public.upsert_resource_translation(p_id uuid, p_lang text, p_resource_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_resource_translation(p_id uuid, p_lang text, p_resource_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_resource_translation(p_id uuid, p_lang text, p_resource_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_resource_translation(p_id uuid, p_lang text, p_resource_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_resource(
  p_id uuid,
  p_lang text,
  p_resource jsonb,
  p_resource_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.resources r
  SET (
    visibility, kind
  ) = (
    SELECT rr.visibility, rr.kind
    FROM jsonb_populate_record(null::public.resources, to_jsonb(r) || p_resource) AS rr
  )
  WHERE r.id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_resource_translation(p_id, p_lang, p_resource_translation);
END;
$$;

ALTER FUNCTION public.update_resource(p_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_resource(p_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_resource(p_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_resource(p_id uuid, p_lang text, p_resource jsonb, p_resource_translation jsonb) TO service_role;
