--------------------------------------------------------------------------------
-- MODIFIER BASE TABLES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.modifiers (
  resource_id uuid NOT NULL,
  CONSTRAINT modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.modifiers TO anon;
GRANT ALL ON TABLE public.modifiers TO authenticated;
GRANT ALL ON TABLE public.modifiers TO service_role;

CREATE TABLE IF NOT EXISTS public.modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  applies_to text,
  composite_name text DEFAULT '{base}'::text NOT NULL,
  CONSTRAINT modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.modifier_translations TO anon;
GRANT ALL ON TABLE public.modifier_translations TO authenticated;
GRANT ALL ON TABLE public.modifier_translations TO service_role;

CREATE OR REPLACE FUNCTION public.validate_modifier_resource_kind()
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
    RAISE EXCEPTION 'Referenced resource % is not a modifier', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_modifier_resource_kind
  BEFORE INSERT OR UPDATE ON public.modifiers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_modifier_resource_kind();

GRANT ALL ON FUNCTION public.validate_modifier_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_modifier_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_modifier_resource_kind() TO service_role;

CREATE POLICY "Users can read modifiers"
ON public.modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new modifiers"
ON public.modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update modifiers"
ON public.modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete modifiers"
ON public.modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read modifier translations"
ON public.modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new modifier translations"
ON public.modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update modifier translations"
ON public.modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete modifier translations"
ON public.modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

--------------------------------------------------------------------------------
-- SPLIT EXISTING EQUIPMENT MODIFIER DATA
--------------------------------------------------------------------------------

INSERT INTO public.modifiers (resource_id)
SELECT em.resource_id
FROM public.equipment_modifiers em
ON CONFLICT (resource_id) DO NOTHING;

INSERT INTO public.modifier_translations (
  resource_id, lang, applies_to, composite_name
)
SELECT
  emt.resource_id,
  emt.lang,
  emt.applies_to,
  coalesce(emt.composite_name, '{base}'::text)
FROM public.equipment_modifier_translations emt
ON CONFLICT (resource_id, lang) DO UPDATE
SET
  applies_to = excluded.applies_to,
  composite_name = excluded.composite_name;

DROP TRIGGER IF EXISTS enforce_equipment_modifier_resource_kind ON public.equipment_modifiers;
DROP FUNCTION IF EXISTS public.validate_equipment_modifier_resource_kind();

ALTER TABLE public.equipment_modifiers
DROP CONSTRAINT IF EXISTS equipment_modifiers_resource_id_fkey;

ALTER TABLE public.equipment_modifiers
ADD CONSTRAINT equipment_modifiers_resource_id_fkey
FOREIGN KEY (resource_id) REFERENCES public.modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.equipment_modifier_translations
DROP COLUMN IF EXISTS applies_to,
DROP COLUMN IF EXISTS composite_name;

--------------------------------------------------------------------------------
-- CONCRETE MODIFIER TABLES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.armor_modifiers (
  resource_id uuid NOT NULL,
  CONSTRAINT armor_modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT armor_modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.armor_modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.armor_modifiers TO anon;
GRANT ALL ON TABLE public.armor_modifiers TO authenticated;
GRANT ALL ON TABLE public.armor_modifiers TO service_role;

CREATE TABLE IF NOT EXISTS public.armor_modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT armor_modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT armor_modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.armor_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT armor_modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.armor_modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.armor_modifier_translations TO anon;
GRANT ALL ON TABLE public.armor_modifier_translations TO authenticated;
GRANT ALL ON TABLE public.armor_modifier_translations TO service_role;

CREATE TABLE IF NOT EXISTS public.item_modifiers (
  resource_id uuid NOT NULL,
  CONSTRAINT item_modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT item_modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.item_modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.item_modifiers TO anon;
GRANT ALL ON TABLE public.item_modifiers TO authenticated;
GRANT ALL ON TABLE public.item_modifiers TO service_role;

CREATE TABLE IF NOT EXISTS public.item_modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT item_modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT item_modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.item_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT item_modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.item_modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.item_modifier_translations TO anon;
GRANT ALL ON TABLE public.item_modifier_translations TO authenticated;
GRANT ALL ON TABLE public.item_modifier_translations TO service_role;

CREATE TABLE IF NOT EXISTS public.tool_modifiers (
  resource_id uuid NOT NULL,
  CONSTRAINT tool_modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT tool_modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tool_modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tool_modifiers TO anon;
GRANT ALL ON TABLE public.tool_modifiers TO authenticated;
GRANT ALL ON TABLE public.tool_modifiers TO service_role;

CREATE TABLE IF NOT EXISTS public.tool_modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT tool_modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT tool_modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.tool_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT tool_modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tool_modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tool_modifier_translations TO anon;
GRANT ALL ON TABLE public.tool_modifier_translations TO authenticated;
GRANT ALL ON TABLE public.tool_modifier_translations TO service_role;

CREATE TABLE IF NOT EXISTS public.weapon_modifiers (
  resource_id uuid NOT NULL,
  CONSTRAINT weapon_modifiers_pkey PRIMARY KEY (resource_id),
  CONSTRAINT weapon_modifiers_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.weapon_modifiers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.weapon_modifiers TO anon;
GRANT ALL ON TABLE public.weapon_modifiers TO authenticated;
GRANT ALL ON TABLE public.weapon_modifiers TO service_role;

CREATE TABLE IF NOT EXISTS public.weapon_modifier_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT weapon_modifier_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT weapon_modifier_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.weapon_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT weapon_modifier_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.weapon_modifier_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.weapon_modifier_translations TO anon;
GRANT ALL ON TABLE public.weapon_modifier_translations TO authenticated;
GRANT ALL ON TABLE public.weapon_modifier_translations TO service_role;

INSERT INTO public.armor_modifiers (resource_id)
SELECT em.resource_id
FROM public.equipment_modifiers em
ON CONFLICT (resource_id) DO NOTHING;

CREATE POLICY "Users can read armor modifiers"
ON public.armor_modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new armor modifiers"
ON public.armor_modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update armor modifiers"
ON public.armor_modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete armor modifiers"
ON public.armor_modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read armor modifier translations"
ON public.armor_modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new armor modifier translations"
ON public.armor_modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update armor modifier translations"
ON public.armor_modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete armor modifier translations"
ON public.armor_modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read item modifiers"
ON public.item_modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new item modifiers"
ON public.item_modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update item modifiers"
ON public.item_modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete item modifiers"
ON public.item_modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read item modifier translations"
ON public.item_modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new item modifier translations"
ON public.item_modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update item modifier translations"
ON public.item_modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete item modifier translations"
ON public.item_modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read tool modifiers"
ON public.tool_modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new tool modifiers"
ON public.tool_modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update tool modifiers"
ON public.tool_modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete tool modifiers"
ON public.tool_modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read tool modifier translations"
ON public.tool_modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new tool modifier translations"
ON public.tool_modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update tool modifier translations"
ON public.tool_modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete tool modifier translations"
ON public.tool_modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read weapon modifiers"
ON public.weapon_modifiers
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new weapon modifiers"
ON public.weapon_modifiers
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update weapon modifiers"
ON public.weapon_modifiers
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete weapon modifiers"
ON public.weapon_modifiers
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

CREATE POLICY "Users can read weapon modifier translations"
ON public.weapon_modifier_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new weapon modifier translations"
ON public.weapon_modifier_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update weapon modifier translations"
ON public.weapon_modifier_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete weapon modifier translations"
ON public.weapon_modifier_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

--------------------------------------------------------------------------------
-- CONCRETE MODIFIER APPLICATION TABLES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.armor_modifier_applications (
  armor_id uuid NOT NULL,
  armor_modifier_id uuid NOT NULL,
  CONSTRAINT armor_modifier_applications_pkey PRIMARY KEY (armor_id, armor_modifier_id),
  CONSTRAINT armor_modifier_applications_armor_id_fkey FOREIGN KEY (armor_id) REFERENCES public.armors(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT armor_modifier_applications_modifier_id_fkey FOREIGN KEY (armor_modifier_id) REFERENCES public.armor_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.armor_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.armor_modifier_applications TO anon;
GRANT ALL ON TABLE public.armor_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.armor_modifier_applications TO service_role;

CREATE INDEX idx_armor_modifier_applications_armor_id
  ON public.armor_modifier_applications USING btree (armor_id);

CREATE INDEX idx_armor_modifier_applications_modifier_id
  ON public.armor_modifier_applications USING btree (armor_modifier_id);

CREATE TABLE IF NOT EXISTS public.item_modifier_applications (
  item_id uuid NOT NULL,
  item_modifier_id uuid NOT NULL,
  CONSTRAINT item_modifier_applications_pkey PRIMARY KEY (item_id, item_modifier_id),
  CONSTRAINT item_modifier_applications_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT item_modifier_applications_modifier_id_fkey FOREIGN KEY (item_modifier_id) REFERENCES public.item_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.item_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.item_modifier_applications TO anon;
GRANT ALL ON TABLE public.item_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.item_modifier_applications TO service_role;

CREATE INDEX idx_item_modifier_applications_item_id
  ON public.item_modifier_applications USING btree (item_id);

CREATE INDEX idx_item_modifier_applications_modifier_id
  ON public.item_modifier_applications USING btree (item_modifier_id);

CREATE TABLE IF NOT EXISTS public.tool_modifier_applications (
  tool_id uuid NOT NULL,
  tool_modifier_id uuid NOT NULL,
  CONSTRAINT tool_modifier_applications_pkey PRIMARY KEY (tool_id, tool_modifier_id),
  CONSTRAINT tool_modifier_applications_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.tools(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT tool_modifier_applications_modifier_id_fkey FOREIGN KEY (tool_modifier_id) REFERENCES public.tool_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tool_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tool_modifier_applications TO anon;
GRANT ALL ON TABLE public.tool_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.tool_modifier_applications TO service_role;

CREATE INDEX idx_tool_modifier_applications_tool_id
  ON public.tool_modifier_applications USING btree (tool_id);

CREATE INDEX idx_tool_modifier_applications_modifier_id
  ON public.tool_modifier_applications USING btree (tool_modifier_id);

CREATE TABLE IF NOT EXISTS public.weapon_modifier_applications (
  weapon_id uuid NOT NULL,
  weapon_modifier_id uuid NOT NULL,
  CONSTRAINT weapon_modifier_applications_pkey PRIMARY KEY (weapon_id, weapon_modifier_id),
  CONSTRAINT weapon_modifier_applications_weapon_id_fkey FOREIGN KEY (weapon_id) REFERENCES public.weapons(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT weapon_modifier_applications_modifier_id_fkey FOREIGN KEY (weapon_modifier_id) REFERENCES public.weapon_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.weapon_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.weapon_modifier_applications TO anon;
GRANT ALL ON TABLE public.weapon_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.weapon_modifier_applications TO service_role;

CREATE INDEX idx_weapon_modifier_applications_weapon_id
  ON public.weapon_modifier_applications USING btree (weapon_id);

CREATE INDEX idx_weapon_modifier_applications_modifier_id
  ON public.weapon_modifier_applications USING btree (weapon_modifier_id);

INSERT INTO public.armor_modifier_applications (armor_id, armor_modifier_id)
SELECT ema.equipment_id, ema.equipment_modifier_id
FROM public.equipment_modifier_applications ema
JOIN public.armors a ON a.resource_id = ema.equipment_id
JOIN public.armor_modifiers am ON am.resource_id = ema.equipment_modifier_id
ON CONFLICT (armor_id, armor_modifier_id) DO NOTHING;

CREATE POLICY "Users can read armor modifier applications"
ON public.armor_modifier_applications
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(armor_id)
  AND public.can_read_resource(armor_modifier_id)
);

CREATE POLICY "Creators and GMs can create armor modifier applications"
ON public.armor_modifier_applications
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(armor_id)
  OR public.can_edit_resource(armor_modifier_id)
);

CREATE POLICY "Creators and GMs can delete armor modifier applications"
ON public.armor_modifier_applications
FOR DELETE TO authenticated
USING (
  public.can_edit_resource(armor_id)
  OR public.can_edit_resource(armor_modifier_id)
);

CREATE POLICY "Users can read item modifier applications"
ON public.item_modifier_applications
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(item_id)
  AND public.can_read_resource(item_modifier_id)
);

CREATE POLICY "Creators and GMs can create item modifier applications"
ON public.item_modifier_applications
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(item_id)
  OR public.can_edit_resource(item_modifier_id)
);

CREATE POLICY "Creators and GMs can delete item modifier applications"
ON public.item_modifier_applications
FOR DELETE TO authenticated
USING (
  public.can_edit_resource(item_id)
  OR public.can_edit_resource(item_modifier_id)
);

CREATE POLICY "Users can read tool modifier applications"
ON public.tool_modifier_applications
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(tool_id)
  AND public.can_read_resource(tool_modifier_id)
);

CREATE POLICY "Creators and GMs can create tool modifier applications"
ON public.tool_modifier_applications
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(tool_id)
  OR public.can_edit_resource(tool_modifier_id)
);

CREATE POLICY "Creators and GMs can delete tool modifier applications"
ON public.tool_modifier_applications
FOR DELETE TO authenticated
USING (
  public.can_edit_resource(tool_id)
  OR public.can_edit_resource(tool_modifier_id)
);

CREATE POLICY "Users can read weapon modifier applications"
ON public.weapon_modifier_applications
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(weapon_id)
  AND public.can_read_resource(weapon_modifier_id)
);

CREATE POLICY "Creators and GMs can create weapon modifier applications"
ON public.weapon_modifier_applications
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(weapon_id)
  OR public.can_edit_resource(weapon_modifier_id)
);

CREATE POLICY "Creators and GMs can delete weapon modifier applications"
ON public.weapon_modifier_applications
FOR DELETE TO authenticated
USING (
  public.can_edit_resource(weapon_id)
  OR public.can_edit_resource(weapon_modifier_id)
);

CREATE OR REPLACE FUNCTION public.replace_armor_modifier_applications(
  p_armor_id uuid,
  p_modifier_ids jsonb)
RETURNS void
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  DELETE FROM public.armor_modifier_applications ama
  WHERE ama.armor_id = p_armor_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
      WHERE (v.value)::uuid = ama.armor_modifier_id
    );

  INSERT INTO public.armor_modifier_applications (armor_id, armor_modifier_id)
  SELECT DISTINCT
    p_armor_id,
    (v.value)::uuid
  FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.armor_modifier_applications ama
    WHERE ama.armor_id = p_armor_id
      AND ama.armor_modifier_id = (v.value)::uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.replace_item_modifier_applications(
  p_item_id uuid,
  p_modifier_ids jsonb)
RETURNS void
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  DELETE FROM public.item_modifier_applications ima
  WHERE ima.item_id = p_item_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
      WHERE (v.value)::uuid = ima.item_modifier_id
    );

  INSERT INTO public.item_modifier_applications (item_id, item_modifier_id)
  SELECT DISTINCT
    p_item_id,
    (v.value)::uuid
  FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.item_modifier_applications ima
    WHERE ima.item_id = p_item_id
      AND ima.item_modifier_id = (v.value)::uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.replace_tool_modifier_applications(
  p_tool_id uuid,
  p_modifier_ids jsonb)
RETURNS void
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  DELETE FROM public.tool_modifier_applications tma
  WHERE tma.tool_id = p_tool_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
      WHERE (v.value)::uuid = tma.tool_modifier_id
    );

  INSERT INTO public.tool_modifier_applications (tool_id, tool_modifier_id)
  SELECT DISTINCT
    p_tool_id,
    (v.value)::uuid
  FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.tool_modifier_applications tma
    WHERE tma.tool_id = p_tool_id
      AND tma.tool_modifier_id = (v.value)::uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.replace_weapon_modifier_applications(
  p_weapon_id uuid,
  p_modifier_ids jsonb)
RETURNS void
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  DELETE FROM public.weapon_modifier_applications wma
  WHERE wma.weapon_id = p_weapon_id
    AND NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
      WHERE (v.value)::uuid = wma.weapon_modifier_id
    );

  INSERT INTO public.weapon_modifier_applications (weapon_id, weapon_modifier_id)
  SELECT DISTINCT
    p_weapon_id,
    (v.value)::uuid
  FROM jsonb_array_elements_text(coalesce(p_modifier_ids, '[]'::jsonb)) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.weapon_modifier_applications wma
    WHERE wma.weapon_id = p_weapon_id
      AND wma.weapon_modifier_id = (v.value)::uuid
  );
$$;

GRANT ALL ON FUNCTION public.replace_armor_modifier_applications(p_armor_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_armor_modifier_applications(p_armor_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_armor_modifier_applications(p_armor_id uuid, p_modifier_ids jsonb) TO service_role;

GRANT ALL ON FUNCTION public.replace_item_modifier_applications(p_item_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_item_modifier_applications(p_item_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_item_modifier_applications(p_item_id uuid, p_modifier_ids jsonb) TO service_role;

GRANT ALL ON FUNCTION public.replace_tool_modifier_applications(p_tool_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_tool_modifier_applications(p_tool_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_tool_modifier_applications(p_tool_id uuid, p_modifier_ids jsonb) TO service_role;

GRANT ALL ON FUNCTION public.replace_weapon_modifier_applications(p_weapon_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_weapon_modifier_applications(p_weapon_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_weapon_modifier_applications(p_weapon_id uuid, p_modifier_ids jsonb) TO service_role;

--------------------------------------------------------------------------------
-- EQUIPMENT FUNCTIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_equipment(
  p_source_id uuid,
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
    p_source_id,
    p_lang,
    p_equipment || jsonb_build_object(
      'kind',
      coalesce(
        (p_equipment->>'kind')::public.resource_kind,
        'equipment'::public.resource_kind
      )
    ),
    p_equipment_translation
  );

  INSERT INTO public.equipments (
    resource_id, cost, magic, rarity, required_attunement_slots, weight
  ) VALUES (
    v_id, r.cost, r.magic, r.rarity, coalesce(r.required_attunement_slots, 0), r.weight
  );

  perform public.replace_resource_feature_entries(
    v_id,
    coalesce(p_equipment->'feature_entries', '[]'::jsonb)
  );

  perform public.upsert_equipment_translation(v_id, p_lang, p_equipment_translation);

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.fetch_equipment(p_id uuid)
RETURNS public.equipment_row
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
    e.cost,
    e.magic,
    e.rarity,
    e.weight,
    public.fetch_resource_feature_entries(r.id) AS feature_entries,
    coalesce(tt.notes, '{}'::jsonb) AS notes,
    e.required_attunement_slots,
    coalesce(tt.attunement_notes, '{}'::jsonb) AS attunement_notes,
    coalesce(mm.modifier_ids, '[]'::jsonb) AS modifier_ids
  FROM public.fetch_resource(p_id) AS r
  JOIN public.equipments e ON e.resource_id = r.id
  LEFT JOIN (
    SELECT
      ma.equipment_id AS id,
      jsonb_agg(ma.equipment_modifier_id ORDER BY ma.equipment_modifier_id) AS modifier_ids
    FROM (
      SELECT armor_id AS equipment_id, armor_modifier_id AS equipment_modifier_id
      FROM public.armor_modifier_applications
      UNION ALL
      SELECT item_id AS equipment_id, item_modifier_id AS equipment_modifier_id
      FROM public.item_modifier_applications
      UNION ALL
      SELECT tool_id AS equipment_id, tool_modifier_id AS equipment_modifier_id
      FROM public.tool_modifier_applications
      UNION ALL
      SELECT weapon_id AS equipment_id, weapon_modifier_id AS equipment_modifier_id
      FROM public.weapon_modifier_applications
    ) ma
    WHERE ma.equipment_id = p_id
    GROUP BY ma.equipment_id
  ) mm ON mm.id = r.id
  LEFT JOIN (
    SELECT
      e.resource_id AS id,
      jsonb_object_agg(t.lang, t.attunement_notes) AS attunement_notes,
      jsonb_object_agg(t.lang, t.notes) AS notes
    FROM public.equipments e
    LEFT JOIN public.equipment_translations t ON t.resource_id = e.resource_id
    WHERE e.resource_id = p_id
    GROUP BY e.resource_id
  ) tt ON tt.id = r.id
  WHERE r.id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.fetch_equipments(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.equipment_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    (p_filters ? 'magic')::int::boolean AS has_magic_filter,
    (p_filters->>'magic')::boolean AS magic_val,
    (p_filters ? 'requires_attunement')::int::boolean AS has_attunement_filter,
    (p_filters->>'requires_attunement')::boolean AS attunement_val,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.equipment_rarity), null)
      FROM jsonb_each_text(p_filters->'rarities') AS e(key, value)
      WHERE e.value = 'true'
    ) AS rarity_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.equipment_rarity), null)
      FROM jsonb_each_text(p_filters->'rarities') AS e(key, value)
      WHERE e.value = 'false'
    ) AS rarity_exc
),
base AS (
  SELECT r.*
  FROM public.fetch_resources(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS r
  WHERE r.kind = any(ARRAY[
    'equipment'::public.resource_kind,
    'armor'::public.resource_kind,
    'weapon'::public.resource_kind,
    'tool'::public.resource_kind,
    'item'::public.resource_kind
  ])
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
    e.cost,
    e.magic,
    e.rarity,
    e.required_attunement_slots,
    e.weight
  FROM base b
  JOIN public.equipments e ON e.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (not p.has_magic_filter OR s.magic = p.magic_val)
    AND (not p.has_attunement_filter OR (s.required_attunement_slots > 0) = p.attunement_val)
    AND (p.rarity_inc IS NULL OR s.rarity = any(p.rarity_inc))
    AND (p.rarity_exc IS NULL OR NOT (s.rarity = any(p.rarity_exc)))
),
t AS (
  SELECT
    f.id,
    jsonb_object_agg(t.lang, t.attunement_notes) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS attunement_notes,
    jsonb_object_agg(t.lang, t.notes) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS notes
  FROM filtered f
  LEFT JOIN public.equipment_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY f.id
),
m AS (
  SELECT
    f.id,
    jsonb_agg(ma.equipment_modifier_id ORDER BY ma.equipment_modifier_id) FILTER (WHERE ma.equipment_modifier_id IS NOT NULL) AS modifier_ids
  FROM filtered f
  LEFT JOIN (
    SELECT armor_id AS equipment_id, armor_modifier_id AS equipment_modifier_id
    FROM public.armor_modifier_applications
    UNION ALL
    SELECT item_id AS equipment_id, item_modifier_id AS equipment_modifier_id
    FROM public.item_modifier_applications
    UNION ALL
    SELECT tool_id AS equipment_id, tool_modifier_id AS equipment_modifier_id
    FROM public.tool_modifier_applications
    UNION ALL
    SELECT weapon_id AS equipment_id, weapon_modifier_id AS equipment_modifier_id
    FROM public.weapon_modifier_applications
  ) ma ON ma.equipment_id = f.id
  GROUP BY f.id
)
SELECT
  f.source_id,
  f.source_code,
  f.source_version,
  f.id,
  f.kind,
  f.visibility,
  f.image_url,
  f.name,
  f.name_short,
  f.page,
  f.cost,
  f.magic,
  f.rarity,
  f.weight,
  public.fetch_resource_feature_entries(f.id) AS feature_entries,
  coalesce(tt.notes, '{}'::jsonb) AS notes,
  f.required_attunement_slots,
  coalesce(tt.attunement_notes, '{}'::jsonb) AS attunement_notes,
  coalesce(m.modifier_ids, '[]'::jsonb) AS modifier_ids
FROM filtered f
LEFT JOIN t tt ON tt.id = f.id
LEFT JOIN m ON m.id = f.id
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
    p_equipment || jsonb_build_object(
      'kind',
      coalesce(
        (p_equipment->>'kind')::public.resource_kind,
        'equipment'::public.resource_kind
      )
    ),
    p_equipment_translation
  );

  UPDATE public.equipments e
  SET (
    cost, magic, rarity, required_attunement_slots, weight
  ) = (
    SELECT r.cost, r.magic, r.rarity, r.required_attunement_slots, r.weight
    FROM jsonb_populate_record(null::public.equipments, to_jsonb(e) || p_equipment) AS r
  )
  WHERE e.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_equipment ? 'feature_entries' THEN
    perform public.replace_resource_feature_entries(
      p_id,
      p_equipment->'feature_entries'
    );
  END IF;

  perform public.upsert_equipment_translation(p_id, p_lang, p_equipment_translation);
END;
$$;

--------------------------------------------------------------------------------
-- EQUIPMENT MODIFIER FUNCTIONS
--------------------------------------------------------------------------------

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

  INSERT INTO public.modifiers (resource_id)
  VALUES (v_id);

  INSERT INTO public.equipment_modifiers (
    resource_id, cost_delta, make_magic, rarity_minimum,
    required_attunement_slots_minimum, weight_delta
  ) VALUES (
    v_id, coalesce(r.cost_delta, 0), coalesce(r.make_magic, false), r.rarity_minimum,
    coalesce(r.required_attunement_slots_minimum, 0), coalesce(r.weight_delta, 0)
  );

  INSERT INTO public.armor_modifiers (resource_id)
  VALUES (v_id);

  INSERT INTO public.armor_modifier_applications (armor_id, armor_modifier_id)
  SELECT
    (value)::uuid,
    v_id
  FROM jsonb_array_elements_text(
    coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.armor_modifier_applications ama
    WHERE ama.armor_id = (v.value)::uuid
      AND ama.armor_modifier_id = v_id
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
    coalesce(tt.notes_delta, '{}'::jsonb) AS notes_delta,
    coalesce(ee.equipment_ids, '[]'::jsonb) AS equipment_ids
  FROM public.fetch_resource(p_id) AS r
  JOIN public.equipment_modifiers em ON em.resource_id = r.id
  LEFT JOIN (
    SELECT
      ama.armor_modifier_id AS id,
      jsonb_agg(ama.armor_id ORDER BY ama.armor_id) AS equipment_ids
    FROM public.armor_modifier_applications ama
    WHERE ama.armor_modifier_id = p_id
    GROUP BY ama.armor_modifier_id
  ) ee ON ee.id = r.id
  LEFT JOIN (
    SELECT
      em.resource_id AS id,
      jsonb_object_agg(mt.lang, mt.applies_to) AS applies_to,
      jsonb_object_agg(emt.lang, emt.attunement_notes_delta) AS attunement_notes_delta,
      jsonb_object_agg(mt.lang, mt.composite_name) AS composite_name,
      jsonb_object_agg(emt.lang, emt.notes_delta) AS notes_delta
    FROM public.equipment_modifiers em
    LEFT JOIN public.modifier_translations mt ON mt.resource_id = em.resource_id
    LEFT JOIN public.equipment_modifier_translations emt
      ON emt.resource_id = em.resource_id
      AND emt.lang = mt.lang
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
    em.weight_delta,
    coalesce(ee.equipment_ids, '[]'::jsonb) AS equipment_ids
  FROM base b
  JOIN public.equipment_modifiers em ON em.resource_id = b.id
  LEFT JOIN (
    SELECT
      ama.armor_modifier_id AS id,
      jsonb_agg(ama.armor_id ORDER BY ama.armor_id) AS equipment_ids
    FROM public.armor_modifier_applications ama
    GROUP BY ama.armor_modifier_id
  ) ee ON ee.id = b.id
),
t AS (
  SELECT
    s.id,
    jsonb_object_agg(mt.lang, mt.applies_to) FILTER (WHERE array_length(p_langs,1) IS NULL OR mt.lang = any(p_langs)) AS applies_to,
    jsonb_object_agg(emt.lang, emt.attunement_notes_delta) FILTER (WHERE array_length(p_langs,1) IS NULL OR emt.lang = any(p_langs)) AS attunement_notes_delta,
    jsonb_object_agg(mt.lang, mt.composite_name) FILTER (WHERE array_length(p_langs,1) IS NULL OR mt.lang = any(p_langs)) AS composite_name,
    jsonb_object_agg(emt.lang, emt.notes_delta) FILTER (WHERE array_length(p_langs,1) IS NULL OR emt.lang = any(p_langs)) AS notes_delta
  FROM src s
  LEFT JOIN public.modifier_translations mt ON mt.resource_id = s.id
  LEFT JOIN public.equipment_modifier_translations emt
    ON emt.resource_id = s.id
    AND emt.lang = mt.lang
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
  coalesce(t.notes_delta, '{}'::jsonb) AS notes_delta,
  s.equipment_ids
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
  mr public.modifier_translations%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.equipment_modifier_translations, p_equipment_modifier_translation);
  mr := jsonb_populate_record(null::public.modifier_translations, p_equipment_modifier_translation);

  INSERT INTO public.modifier_translations AS mt (
    resource_id, lang, applies_to, composite_name
  ) VALUES (
    p_id, p_lang, mr.applies_to, coalesce(mr.composite_name, '{base}'::text)
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    applies_to = excluded.applies_to,
    composite_name = excluded.composite_name;

  INSERT INTO public.equipment_modifier_translations AS emt (
    resource_id, lang, attunement_notes_delta, notes_delta
  ) VALUES (
    p_id, p_lang, r.attunement_notes_delta, r.notes_delta
  )
  ON conflict (resource_id, lang) DO UPDATE
  SET
    attunement_notes_delta = excluded.attunement_notes_delta,
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

  IF p_equipment_modifier ? 'equipment_ids' THEN
    DELETE FROM public.armor_modifier_applications ama
    WHERE ama.armor_modifier_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(
          coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)
        ) v
        WHERE (v.value)::uuid = ama.armor_id
      );

    INSERT INTO public.armor_modifier_applications (armor_id, armor_modifier_id)
    SELECT DISTINCT
      (v.value)::uuid,
      p_id
    FROM jsonb_array_elements_text(
      coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)
    ) v
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.armor_modifier_applications ama
      WHERE ama.armor_id = (v.value)::uuid
        AND ama.armor_modifier_id = p_id
    );
  END IF;

  perform public.upsert_equipment_modifier_translation(
    p_id,
    p_lang,
    p_equipment_modifier_translation
  );
END;
$$;

--------------------------------------------------------------------------------
-- CONCRETE EQUIPMENT CREATE/UPDATE FUNCTIONS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_armor(
  p_source_id uuid,
  p_lang text,
  p_armor jsonb,
  p_armor_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.armors%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.armors, p_armor);

  v_id := public.create_equipment(
    p_source_id,
    p_lang,
    p_armor || jsonb_build_object('kind', 'armor'::public.resource_kind),
    p_armor_translation
  );

  INSERT INTO public.armors (
    resource_id,
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type
  ) VALUES (
    v_id,
    r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
    r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
    r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
    r.armor_class_modifier, r.base_armor_class,
    r.disadvantage_on_stealth,
    r.required_cha, r.required_con, r.required_dex,
    r.required_int, r.required_str, r.required_wis,
    r.type
  );

  perform public.replace_armor_modifier_applications(
    v_id,
    coalesce(p_armor->'modifier_ids', '[]'::jsonb)
  );

  perform public.upsert_armor_translation(v_id, p_lang, p_armor_translation);

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_armor(
  p_id uuid,
  p_lang text,
  p_armor jsonb,
  p_armor_translation jsonb)
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
    p_armor || jsonb_build_object('kind', 'armor'::public.resource_kind),
    p_armor_translation
  );

  UPDATE public.armors s
  SET (
    armor_class_max_cha_modifier, armor_class_max_con_modifier,
    armor_class_max_dex_modifier, armor_class_max_int_modifier,
    armor_class_max_str_modifier, armor_class_max_wis_modifier,
    armor_class_modifier, base_armor_class,
    disadvantage_on_stealth,
    required_cha, required_con, required_dex,
    required_int, required_str, required_wis,
    type
  ) = (
    SELECT r.armor_class_max_cha_modifier, r.armor_class_max_con_modifier,
      r.armor_class_max_dex_modifier, r.armor_class_max_int_modifier,
      r.armor_class_max_str_modifier, r.armor_class_max_wis_modifier,
      r.armor_class_modifier, r.base_armor_class,
      r.disadvantage_on_stealth,
      r.required_cha, r.required_con,
      r.required_dex, r.required_int,
      r.required_str, r.required_wis,
      r.type
    FROM jsonb_populate_record(null::public.armors, to_jsonb(s) || p_armor) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_armor ? 'modifier_ids' THEN
    perform public.replace_armor_modifier_applications(
      p_id,
      p_armor->'modifier_ids'
    );
  END IF;

  perform public.upsert_armor_translation(p_id, p_lang, p_armor_translation);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_item(
  p_source_id uuid,
  p_lang text,
  p_item jsonb,
  p_item_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.items%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.items, p_item);
  v_id := public.create_equipment(
    p_source_id,
    p_lang,
    p_item || jsonb_build_object('kind', 'item'::public.resource_kind),
    p_item_translation
  );

  INSERT INTO public.items (resource_id, type, charges, consumable)
  VALUES (v_id, r.type, r.charges, r.consumable);

  perform public.replace_item_modifier_applications(
    v_id,
    coalesce(p_item->'modifier_ids', '[]'::jsonb)
  );

  perform public.upsert_item_translation(v_id, p_lang, p_item_translation);

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_item(
  p_id uuid,
  p_lang text,
  p_item jsonb,
  p_item_translation jsonb)
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
    p_item || jsonb_build_object('kind', 'item'::public.resource_kind),
    p_item_translation
  );

  UPDATE public.items i
  SET (
    type,
    charges,
    consumable
  ) = (
    SELECT r.type, r.charges, r.consumable
    FROM jsonb_populate_record(null::public.items, to_jsonb(i) || p_item) AS r
  )
  WHERE i.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_item ? 'modifier_ids' THEN
    perform public.replace_item_modifier_applications(
      p_id,
      p_item->'modifier_ids'
    );
  END IF;

  perform public.upsert_item_translation(p_id, p_lang, p_item_translation);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_tool(
  p_source_id uuid,
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
    p_source_id,
    p_lang,
    p_tool || jsonb_build_object('kind', 'tool'::public.resource_kind),
    p_tool_translation
  );

  INSERT INTO public.tools (
    resource_id, type, ability
  ) VALUES (
    v_id, r.type, r.ability
  );

  perform public.replace_tool_modifier_applications(
    v_id,
    coalesce(p_tool->'modifier_ids', '[]'::jsonb)
  );

  INSERT INTO public.tool_crafts (tool_id, equipment_id)
  SELECT
    v_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_tool->'craft_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.tool_crafts tc
    WHERE tc.tool_id = v_id
      AND tc.equipment_id = (v.value)::uuid
  );

  perform public.upsert_tool_translation(v_id, p_lang, p_tool_translation);

  RETURN v_id;
END;
$$;

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
    p_tool || jsonb_build_object('kind', 'tool'::public.resource_kind),
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

  IF p_tool ? 'modifier_ids' THEN
    perform public.replace_tool_modifier_applications(
      p_id,
      p_tool->'modifier_ids'
    );
  END IF;

  WITH entries AS (
    SELECT
      (value)::uuid AS equipment_id
    FROM jsonb_array_elements_text(
      coalesce(p_tool->'craft_ids', '[]'::jsonb)
    )
  )
  DELETE FROM public.tool_crafts tc
  WHERE tc.tool_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.equipment_id = tc.equipment_id
    );

  WITH entries AS (
    SELECT
      (value)::uuid AS equipment_id
    FROM jsonb_array_elements_text(
      coalesce(p_tool->'craft_ids', '[]'::jsonb)
    )
  )
  INSERT INTO public.tool_crafts (tool_id, equipment_id)
  SELECT
    p_id,
    e.equipment_id
  FROM (
    SELECT DISTINCT equipment_id FROM entries
  ) e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.tool_crafts tc
    WHERE tc.tool_id = p_id
      AND tc.equipment_id = e.equipment_id
  );

  perform public.upsert_tool_translation(p_id, p_lang, p_tool_translation);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_weapon(
  p_source_id uuid,
  p_lang text,
  p_weapon jsonb,
  p_weapon_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
  r public.weapons%ROWTYPE;
BEGIN
  r := jsonb_populate_record(null::public.weapons, p_weapon);

  v_id := public.create_equipment(
    p_source_id,
    p_lang,
    p_weapon || jsonb_build_object('kind', 'weapon'::public.resource_kind),
    p_weapon_translation
  );

  INSERT INTO public.weapons (
    resource_id, type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged,
    range_short, range_long
  ) VALUES (
    v_id, r.type, r.damage, r.damage_versatile, r.damage_type,
    r.properties, r.mastery, r.melee, r.ranged,
    r.range_short, r.range_long
  );

  perform public.replace_weapon_modifier_applications(
    v_id,
    coalesce(p_weapon->'modifier_ids', '[]'::jsonb)
  );

  INSERT INTO public.weapon_ammunitions (weapon_id, equipment_id)
  SELECT
    v_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_weapon->'ammunition_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.weapon_ammunitions wa
    WHERE wa.weapon_id = v_id
      AND wa.equipment_id = (v.value)::uuid
  );

  perform public.upsert_weapon_translation(v_id, p_lang, p_weapon_translation);

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_weapon(
  p_id uuid,
  p_lang text,
  p_weapon jsonb,
  p_weapon_translation jsonb)
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
    p_weapon || jsonb_build_object('kind', 'weapon'::public.resource_kind),
    p_weapon_translation
  );

  UPDATE public.weapons s
  SET (
    type, damage, damage_versatile, damage_type,
    properties, mastery, melee, ranged,
    range_short, range_long
  ) = (
    SELECT r.type, r.damage, r.damage_versatile, r.damage_type,
           r.properties, r.mastery, r.melee, r.ranged,
           r.range_short, r.range_long
    FROM jsonb_populate_record(null::public.weapons, to_jsonb(s) || p_weapon) AS r
  )
  WHERE s.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  IF p_weapon ? 'modifier_ids' THEN
    perform public.replace_weapon_modifier_applications(
      p_id,
      p_weapon->'modifier_ids'
    );
  END IF;

  WITH entries AS (
    SELECT
      (value)::uuid AS equipment_id
    FROM jsonb_array_elements_text(
      coalesce(p_weapon->'ammunition_ids', '[]'::jsonb)
    )
  )
  DELETE FROM public.weapon_ammunitions wa
  WHERE wa.weapon_id = p_id
    AND NOT EXISTS (
      SELECT 1
      FROM entries e
      WHERE e.equipment_id = wa.equipment_id
    );

  WITH entries AS (
    SELECT
      (value)::uuid AS equipment_id
    FROM jsonb_array_elements_text(
      coalesce(p_weapon->'ammunition_ids', '[]'::jsonb)
    )
  )
  INSERT INTO public.weapon_ammunitions (weapon_id, equipment_id)
  SELECT
    p_id,
    e.equipment_id
  FROM (
    SELECT DISTINCT equipment_id FROM entries
  ) e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.weapon_ammunitions wa
    WHERE wa.weapon_id = p_id
      AND wa.equipment_id = e.equipment_id
  );

  perform public.upsert_weapon_translation(p_id, p_lang, p_weapon_translation);
END;
$$;

DROP TABLE IF EXISTS public.equipment_modifier_applications;
