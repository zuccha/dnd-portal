--------------------------------------------------------------------------------
-- TOOLS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tools (
  resource_id uuid NOT NULL,
  ability public.creature_ability NOT NULL,
  type public.tool_type NOT NULL,
  CONSTRAINT tools_pkey PRIMARY KEY (resource_id),
  CONSTRAINT tools_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tools OWNER TO postgres;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tools TO anon;
GRANT ALL ON TABLE public.tools TO authenticated;
GRANT ALL ON TABLE public.tools TO service_role;


--------------------------------------------------------------------------------
-- TOOL TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tool_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  craft text NOT NULL,
  utilize text NOT NULL,
  CONSTRAINT tool_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT tool_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.tools(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT tool_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tool_translations OWNER TO postgres;
ALTER TABLE public.tool_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tool_translations TO anon;
GRANT ALL ON TABLE public.tool_translations TO authenticated;
GRANT ALL ON TABLE public.tool_translations TO service_role;


--------------------------------------------------------------------------------
-- TOOL ROW
--------------------------------------------------------------------------------

CREATE TYPE public.tool_row AS (
  -- Resource
  campaign_id uuid,
  campaign_name text,
  id uuid,
  kind public.resource_kind,
  visibility public.campaign_role,
  name jsonb,
  page jsonb,
  -- Equipment
  cost integer,
  magic boolean,
  weight integer,
  notes jsonb,
  -- Tool
  ability public.creature_ability,
  type public.tool_type,
  -- Tool Translation
  craft jsonb,
  utilize jsonb
);


--------------------------------------------------------------------------------
-- TOOLS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read tools"
ON public.tools
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new tools"
ON public.tools
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update tools"
ON public.tools
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete tools"
ON public.tools
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- TOOL TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read tool translations"
ON public.tool_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new tool translations"
ON public.tool_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update tool translations"
ON public.tool_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete tool translations"
ON public.tool_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- CREATE TOOL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_tool(
  p_campaign_id uuid,
  p_lang text,
  p_tool jsonb,
  p_tool_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.tools%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.tools, p_tool);

  v_id := public.create_equipment(
    p_campaign_id,
    p_lang,
    p_tool,
    p_tool_translation
  );

  INSERT INTO public.tools (
    resource_id, type, ability
  ) VALUES (
    v_id, r.type, r.ability
  );

  perform public.upsert_tool_translation(v_id, p_lang, p_tool_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_tool(p_campaign_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_tool(p_campaign_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_tool(p_campaign_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_tool(p_campaign_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH TOOL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_tool(p_id uuid)
RETURNS public.tool_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.campaign_id,
    e.campaign_name,
    e.id,
    e.kind,
    e.visibility,
    e.name,
    e.page,
    e.cost,
    e.magic,
    e.weight,
    e.notes,
    t.ability,
    t.type,
    coalesce(tt.craft, '{}'::jsonb) AS craft,
    coalesce(tt.utilize, '{}'::jsonb) AS utilize
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.tools t ON t.resource_id = e.id
  LEFT JOIN (
    SELECT
      t.resource_id AS id,
      jsonb_object_agg(tt.lang, tt.craft) AS craft,
      jsonb_object_agg(tt.lang, tt.utilize) AS utilize
    FROM public.tools t
    LEFT JOIN public.tool_translations tt ON tt.resource_id = t.resource_id
    WHERE t.resource_id = p_id
    GROUP BY t.resource_id
  ) tt ON tt.id = e.id
  WHERE e.id = p_id;
$$;

ALTER FUNCTION public.fetch_tool(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_tool(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_tool(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_tool(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH TOOLS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_tools(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.tool_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    -- types
    (
      SELECT coalesce(array_agg((e.key)::public.tool_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.tool_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc,

    -- abilities
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_ability), null)
      FROM jsonb_each_text(p_filters->'abilities') AS e(key, value)
      WHERE e.value = 'true'
    ) AS abilities_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.creature_ability), null)
      FROM jsonb_each_text(p_filters->'abilities') AS e(key, value)
      WHERE e.value = 'false'
    ) AS abilities_exc
),
base AS (
  SELECT e.*
  FROM public.fetch_equipments(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS e
),
src AS (
  SELECT
    b.id,
    b.campaign_id,
    b.campaign_name,
    b.kind,
    b.visibility,
    b.name,
    b.page,
    b.cost,
    b.magic,
    b.weight,
    b.notes,
    t.ability,
    t.type
  FROM base b
  JOIN public.tools t ON t.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
    AND (p.abilities_inc IS NULL OR s.ability = any(p.abilities_inc))
    AND (p.abilities_exc IS NULL OR NOT (s.ability = any(p.abilities_exc)))
),
tt AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.craft) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS craft,
    jsonb_object_agg(t.lang, t.utilize) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS utilize
  FROM filtered f
  LEFT JOIN public.tool_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY f.id
)
SELECT
  f.campaign_id,
  f.campaign_name,
  f.id,
  f.kind,
  f.visibility,
  f.name,
  f.page,
  f.cost,
  f.magic,
  f.weight,
  f.notes,
  f.ability,
  f.type,
  coalesce(tt.craft, '{}'::jsonb) AS craft,
  coalesce(tt.utilize, '{}'::jsonb) AS utilize
FROM filtered f
LEFT JOIN tt ON tt.id = f.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (f.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (f.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_tools(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_tools(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_tools(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_tools(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT TOOL TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_tool_translation(
  p_id uuid,
  p_lang text,
  p_tool_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.tool_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.tool_translations, p_tool_translation);

  INSERT INTO public.tool_translations AS tt (
    resource_id, lang, utilize, craft
  ) VALUES (
    p_id, p_lang, r.utilize, r.craft
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    utilize = excluded.utilize,
    craft = excluded.craft;

  perform public.upsert_resource_translation(p_id, p_lang, p_tool_translation);
  perform public.upsert_equipment_translation(p_id, p_lang, p_tool_translation);
END;
$$;

ALTER FUNCTION public.upsert_tool_translation(p_id uuid, p_lang text, p_tool_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_tool_translation(p_id uuid, p_lang text, p_tool_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_tool_translation(p_id uuid, p_lang text, p_tool_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_tool_translation(p_id uuid, p_lang text, p_tool_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE TOOL
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_tool(
  p_id uuid,
  p_lang text,
  p_tool jsonb,
  p_tool_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows int;
BEGIN
  perform public.update_equipment(
    p_id,
    p_lang,
    p_tool,
    p_tool_translation
  );

  UPDATE public.tools t
  SET (
    type, ability
  ) = (
    SELECT r.type, r.ability
    FROM jsonb_populate_record(null::public.tools, to_jsonb(t) || p_tool) AS r
  )
  WHERE t.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_tool_translation(p_id, p_lang, p_tool_translation);
END;
$$;

ALTER FUNCTION public.update_tool(p_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_tool(p_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_tool(p_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_tool(p_id uuid, p_lang text, p_tool jsonb, p_tool_translation jsonb) TO service_role;
