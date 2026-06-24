CREATE TABLE IF NOT EXISTS public.equipment_modifiers (
  resource_id uuid NOT NULL,
  cost_delta integer DEFAULT '0'::integer NOT NULL,
  make_magic boolean DEFAULT 'false'::boolean NOT NULL,
  rarity_minimum public.equipment_rarity NOT NULL,
  required_attunement_slots_minimum smallint DEFAULT '0'::smallint NOT NULL,
  weight_delta integer DEFAULT '0'::integer NOT NULL,
  CONSTRAINT equipment_modifiers_required_attunement_slots_minimum_check CHECK (required_attunement_slots_minimum >= 0),
  CONSTRAINT equipment_modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT equipment_modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.equipment_modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.equipment_modifiers TO anon;
GRANT ALL ON TABLE public.equipment_modifiers TO authenticated;
GRANT ALL ON TABLE public.equipment_modifiers TO service_role;

CREATE TABLE IF NOT EXISTS public.equipment_modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  applies_to text,
  attunement_notes_delta text,
  composite_name text DEFAULT '{base}'::text NOT NULL,
  notes_delta text,
  CONSTRAINT equipment_modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT equipment_modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT equipment_modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.equipment_modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.equipment_modifier_translations TO anon;
GRANT ALL ON TABLE public.equipment_modifier_translations TO authenticated;
GRANT ALL ON TABLE public.equipment_modifier_translations TO service_role;

CREATE OR REPLACE FUNCTION public.validate_equipment_modifier_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'equipment_modifier'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not an equipment modifier', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_equipment_modifier_resource_kind
  BEFORE INSERT OR UPDATE ON public.equipment_modifiers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_equipment_modifier_resource_kind();

GRANT ALL ON FUNCTION public.validate_equipment_modifier_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_equipment_modifier_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_equipment_modifier_resource_kind() TO service_role;

CREATE POLICY "Users can read equipment modifiers"
ON public.equipment_modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new equipment modifiers"
ON public.equipment_modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update equipment modifiers"
ON public.equipment_modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete equipment modifiers"
ON public.equipment_modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read equipment modifier translations"
ON public.equipment_modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new equipment modifier translations"
ON public.equipment_modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update equipment modifier translations"
ON public.equipment_modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete equipment modifier translations"
ON public.equipment_modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE TYPE public.equipment_modifier_row AS (
  source_id uuid,
  source_code text,
  source_version public.source_version,
  id uuid,
  kind public.resource_kind,
  visibility public.resource_visibility,
  image_url text,
  name jsonb,
  name_short jsonb,
  page jsonb,
  cost_delta integer,
  make_magic boolean,
  rarity_minimum public.equipment_rarity,
  required_attunement_slots_minimum smallint,
  weight_delta integer,
  applies_to jsonb,
  attunement_notes_delta jsonb,
  composite_name jsonb,
  notes_delta jsonb
);

ALTER TYPE public.equipment_modifier_row OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.create_equipment_modifier(
  p_source_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.equipment_modifiers%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipment_modifiers, p_equipment_modifier);

  v_id := public.create_resource(
    p_source_id,
    p_lang,
    p_equipment_modifier || jsonb_build_object('kind', 'equipment_modifier'::public.resource_kind),
    p_equipment_modifier_translation
  );

  INSERT INTO public.equipment_modifiers (
    resource_id, cost_delta, make_magic, rarity_minimum,
    required_attunement_slots_minimum, weight_delta
  ) VALUES (
    v_id, coalesce(r.cost_delta, 0), coalesce(r.make_magic, false), r.rarity_minimum,
    coalesce(r.required_attunement_slots_minimum, 0), coalesce(r.weight_delta, 0)
  );

  perform public.upsert_equipment_modifier_translation(
    v_id,
    p_lang,
    p_equipment_modifier_translation
  );

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.fetch_equipment_modifier(p_id uuid)
RETURNS public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    r.source_id,
    r.source_code,
    r.source_version,
    r.id,
    r.kind,
    r.visibility,
    r.image_url,
    r.name,
    r.name_short,
    r.page,
    em.cost_delta,
    em.make_magic,
    em.rarity_minimum,
    em.required_attunement_slots_minimum,
    em.weight_delta,
    coalesce(tt.applies_to, '{}'::jsonb) AS applies_to,
    coalesce(tt.attunement_notes_delta, '{}'::jsonb) AS attunement_notes_delta,
    coalesce(tt.composite_name, '{}'::jsonb) AS composite_name,
    coalesce(tt.notes_delta, '{}'::jsonb) AS notes_delta
  FROM public.fetch_resource(p_id) AS r
  JOIN public.equipment_modifiers em ON em.resource_id = r.id
  LEFT JOIN (
    SELECT
      em.resource_id AS id,
      jsonb_object_agg(t.lang, t.applies_to) AS applies_to,
      jsonb_object_agg(t.lang, t.attunement_notes_delta) AS attunement_notes_delta,
      jsonb_object_agg(t.lang, t.composite_name) AS composite_name,
      jsonb_object_agg(t.lang, t.notes_delta) AS notes_delta
    FROM public.equipment_modifiers em
    LEFT JOIN public.equipment_modifier_translations t ON t.resource_id = em.resource_id
    WHERE em.resource_id = p_id
    GROUP BY em.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.fetch_equipment_modifiers(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.equipment_modifier_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = 'equipment_modifier'::public.resource_kind
),
src AS (
  SELECT
    b.id,
    b.source_id,
    b.source_code,
    b.source_version,
    b.kind,
    b.visibility,
    b.image_url,
    b.name,
    b.name_short,
    b.page,
    em.cost_delta,
    em.make_magic,
    em.rarity_minimum,
    em.required_attunement_slots_minimum,
    em.weight_delta
  FROM base b
  JOIN public.equipment_modifiers em ON em.resource_id = b.id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(t.lang, t.applies_to) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS applies_to,
    jsonb_object_agg(t.lang, t.attunement_notes_delta) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS attunement_notes_delta,
    jsonb_object_agg(t.lang, t.composite_name) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS composite_name,
    jsonb_object_agg(t.lang, t.notes_delta) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS notes_delta
  FROM src s
  LEFT JOIN public.equipment_modifier_translations t ON t.resource_id = s.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY s.id
)
SELECT
  s.source_id,
  s.source_code,
  s.source_version,
  s.id,
  s.kind,
  s.visibility,
  s.image_url,
  s.name,
  s.name_short,
  s.page,
  s.cost_delta,
  s.make_magic,
  s.rarity_minimum,
  s.required_attunement_slots_minimum,
  s.weight_delta,
  coalesce(t.applies_to, '{}'::jsonb) AS applies_to,
  coalesce(t.attunement_notes_delta, '{}'::jsonb) AS attunement_notes_delta,
  coalesce(t.composite_name, '{}'::jsonb) AS composite_name,
  coalesce(t.notes_delta, '{}'::jsonb) AS notes_delta
FROM src s
LEFT JOIN t ON t.id = s.id
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

CREATE OR REPLACE FUNCTION public.upsert_equipment_modifier_translation(
  p_id uuid,
  p_lang text,
  p_equipment_modifier_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  r public.equipment_modifier_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipment_modifier_translations, p_equipment_modifier_translation);

  INSERT INTO public.equipment_modifier_translations AS emt (
    resource_id, lang, applies_to, attunement_notes_delta, composite_name, notes_delta
  ) VALUES (
    p_id, p_lang, r.applies_to, r.attunement_notes_delta, coalesce(r.composite_name, '{base}'::text), r.notes_delta
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    applies_to = excluded.applies_to,
    attunement_notes_delta = excluded.attunement_notes_delta,
    composite_name = excluded.composite_name,
    notes_delta = excluded.notes_delta;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_equipment_modifier(
  p_id uuid,
  p_lang text,
  p_equipment_modifier jsonb,
  p_equipment_modifier_translation jsonb)
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
    p_equipment_modifier || jsonb_build_object('kind', 'equipment_modifier'::public.resource_kind),
    p_equipment_modifier_translation
  );

  UPDATE public.equipment_modifiers em
  SET (
    cost_delta, make_magic, rarity_minimum,
    required_attunement_slots_minimum, weight_delta
  ) = (
    SELECT r.cost_delta, r.make_magic, r.rarity_minimum,
      r.required_attunement_slots_minimum, r.weight_delta
    FROM jsonb_populate_record(null::public.equipment_modifiers, to_jsonb(em) || p_equipment_modifier) AS r
  )
  WHERE em.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_equipment_modifier_translation(
    p_id,
    p_lang,
    p_equipment_modifier_translation
  );
END;
$$;

GRANT ALL ON FUNCTION public.create_equipment_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_equipment_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_equipment_modifier(p_source_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;

GRANT ALL ON FUNCTION public.fetch_equipment_modifier(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipment_modifier(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipment_modifier(p_id uuid) TO service_role;

GRANT ALL ON FUNCTION public.fetch_equipment_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_equipment_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_equipment_modifiers(p_source_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;

GRANT ALL ON FUNCTION public.upsert_equipment_modifier_translation(p_id uuid, p_lang text, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_equipment_modifier_translation(p_id uuid, p_lang text, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_equipment_modifier_translation(p_id uuid, p_lang text, p_equipment_modifier_translation jsonb) TO service_role;

GRANT ALL ON FUNCTION public.update_equipment_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_equipment_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_equipment_modifier(p_id uuid, p_lang text, p_equipment_modifier jsonb, p_equipment_modifier_translation jsonb) TO service_role;
