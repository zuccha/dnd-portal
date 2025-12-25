--------------------------------------------------------------------------------
-- EQUIPMENT
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.equipments (
  resource_id uuid NOT NULL,
  cost integer DEFAULT '0'::integer NOT NULL,
  magic boolean DEFAULT 'false'::boolean NOT NULL,
  weight integer DEFAULT '0'::integer NOT NULL,
  CONSTRAINT equipments_pkey PRIMARY KEY (resource_id),
  CONSTRAINT equipments_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.equipments OWNER TO postgres;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.equipments TO anon;
GRANT ALL ON TABLE public.equipments TO authenticated;
GRANT ALL ON TABLE public.equipments TO service_role;


--------------------------------------------------------------------------------
-- EQUIPMENT TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.equipment_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  notes text,
  CONSTRAINT equipment_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT equipment_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT equipment_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.languages(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.equipment_translations OWNER TO postgres;
ALTER TABLE public.equipment_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.equipment_translations TO anon;
GRANT ALL ON TABLE public.equipment_translations TO authenticated;
GRANT ALL ON TABLE public.equipment_translations TO service_role;


--------------------------------------------------------------------------------
-- EQUIPMENT ROW
--------------------------------------------------------------------------------

CREATE TYPE public.equipment_row AS (
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
  -- Equipment Translation
  notes jsonb
);


--------------------------------------------------------------------------------
-- EQUIPMENT RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_equipment_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'equipment'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not an equipment', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_equipment_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_equipment_resource_kind
  BEFORE INSERT OR UPDATE ON public.equipments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_equipment_resource_kind();

GRANT ALL ON FUNCTION public.validate_equipment_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_equipment_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_equipment_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- EQUIPMENTS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read equipments"
ON public.equipments
FOR SELECT TO authenticated
USING (public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can create new equipments"
ON public.equipments
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update equipments"
ON public.equipments
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete equipments"
ON public.equipments
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- EQUIPMENT TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read equipment translations"
ON public.equipment_translations
FOR SELECT TO authenticated
USING (public.can_read_resource(resource_id) OR public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can create new equipment translations"
ON public.equipment_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update equipment translations"
ON public.equipment_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete equipment translations"
ON public.equipment_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- CREATE EQUIPMENT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_equipment(
  p_campaign_id uuid,
  p_lang text,
  p_equipment jsonb,
  p_equipment_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.equipments%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipments, p_equipment);

  v_id := public.create_resource(
    p_campaign_id,
    p_lang,
    p_equipment || jsonb_build_object('kind', 'equipment'::public.resource_kind),
    p_equipment_translation
  );

  INSERT INTO public.equipments (
    resource_id, cost, magic, weight
  ) VALUES (
    v_id, r.cost, r.magic, r.weight
  );

  perform public.upsert_equipment_translation(v_id, p_lang, p_equipment_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_equipment(p_campaign_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_equipment(p_campaign_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_equipment(p_campaign_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_equipment(p_campaign_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH EQUIPMENT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_equipment(p_id uuid)
RETURNS public.equipment_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.campaign_id,
    r.campaign_name,
    r.id,
    r.kind,
    r.visibility,
    r.name,
    r.page,
    e.cost,
    e.magic,
    e.weight,
    coalesce(tt.notes, '{}'::jsonb) AS notes
  FROM public.fetch_resource(p_id) AS r
  JOIN public.equipments e ON e.resource_id = r.id
  LEFT JOIN (
    SELECT
      e.resource_id AS id,
      jsonb_object_agg(t.lang, t.notes) AS notes
    FROM public.equipments e
    LEFT JOIN public.equipment_translations t ON t.resource_id = e.resource_id
    WHERE e.resource_id = p_id
    GROUP BY e.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

ALTER FUNCTION public.fetch_equipment(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_equipment(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipment(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipment(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH EQUIPMENTS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_equipments(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.equipment_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_campaign_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'equipment'::public.resource_kind
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
    e.cost,
    e.magic,
    e.weight
  FROM base b
  JOIN public.equipments e ON e.resource_id = b.id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.notes) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS notes
  FROM src s
  LEFT JOIN public.equipment_translations t ON t.resource_id = s.id
  LEFT JOIN (SELECT 1) _ ON true  -- keep p_langs in scope
  GROUP BY s.id
)
SELECT
  s.campaign_id,
  s.campaign_name,
  s.id,
  s.kind,
  s.visibility,
  s.name,
  s.page,
  s.cost,
  s.magic,
  s.weight,
  coalesce(tt.notes, '{}'::jsonb) AS notes
FROM src s
LEFT JOIN t tt ON tt.id = s.id
ORDER BY
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'asc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END ASC NULLS LAST,
  CASE
    WHEN p_order_by = 'name' AND p_order_dir = 'desc'
      THEN (s.name->>coalesce(p_langs[1],'en'))
  END DESC NULLS LAST;
$$;

ALTER FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipments(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT EQUIPMENT TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_equipment_translation(
  p_id uuid,
  p_lang text,
  p_equipment_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.equipment_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipment_translations, p_equipment_translation);

  INSERT INTO public.equipment_translations AS et (
    resource_id, lang, notes
  ) VALUES (
    p_id, p_lang, r.notes
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    notes = excluded.notes;
END;
$$;

ALTER FUNCTION public.upsert_equipment_translation(p_id uuid, p_lang text, p_equipment_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_equipment_translation(p_id uuid, p_lang text, p_equipment_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_equipment_translation(p_id uuid, p_lang text, p_equipment_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_equipment_translation(p_id uuid, p_lang text, p_equipment_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE EQUIPMENT
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_equipment(
  p_id uuid,
  p_lang text,
  p_equipment jsonb,
  p_equipment_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows int;
BEGIN
  perform public.update_resource(
    p_id,
    p_lang,
    p_equipment || jsonb_build_object('kind', 'equipment'::public.resource_kind),
    p_equipment_translation
  );

  UPDATE public.equipments e
  SET (
    cost, magic, weight
  ) = (
    SELECT r.cost, r.magic, r.weight
    FROM jsonb_populate_record(null::public.equipments, to_jsonb(e) || p_equipment) AS r
  )
  WHERE e.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_equipment_translation(p_id, p_lang, p_equipment_translation);
END;
$$;

ALTER FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_equipment(p_id uuid, p_lang text, p_equipment jsonb, p_equipment_translation jsonb) TO service_role;
