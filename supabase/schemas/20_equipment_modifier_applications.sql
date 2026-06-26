--------------------------------------------------------------------------------
-- ARMOR MODIFIER APPLICATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.armor_modifier_applications (
  armor_id uuid NOT NULL,
  armor_modifier_id uuid NOT NULL,
  CONSTRAINT armor_modifier_applications_pkey PRIMARY KEY (armor_id, armor_modifier_id),
  CONSTRAINT armor_modifier_applications_armor_id_fkey FOREIGN KEY (armor_id) REFERENCES public.armors(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT armor_modifier_applications_modifier_id_fkey FOREIGN KEY (armor_modifier_id) REFERENCES public.armor_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.armor_modifier_applications OWNER TO postgres;
ALTER TABLE public.armor_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.armor_modifier_applications TO anon;
GRANT ALL ON TABLE public.armor_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.armor_modifier_applications TO service_role;

CREATE INDEX idx_armor_modifier_applications_armor_id
  ON public.armor_modifier_applications USING btree (armor_id);

CREATE INDEX idx_armor_modifier_applications_modifier_id
  ON public.armor_modifier_applications USING btree (armor_modifier_id);

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

ALTER FUNCTION public.replace_armor_modifier_applications(p_armor_id uuid, p_modifier_ids jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.replace_armor_modifier_applications(p_armor_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_armor_modifier_applications(p_armor_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_armor_modifier_applications(p_armor_id uuid, p_modifier_ids jsonb) TO service_role;


--------------------------------------------------------------------------------
-- ITEM MODIFIER APPLICATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.item_modifier_applications (
  item_id uuid NOT NULL,
  item_modifier_id uuid NOT NULL,
  CONSTRAINT item_modifier_applications_pkey PRIMARY KEY (item_id, item_modifier_id),
  CONSTRAINT item_modifier_applications_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT item_modifier_applications_modifier_id_fkey FOREIGN KEY (item_modifier_id) REFERENCES public.item_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.item_modifier_applications OWNER TO postgres;
ALTER TABLE public.item_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.item_modifier_applications TO anon;
GRANT ALL ON TABLE public.item_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.item_modifier_applications TO service_role;

CREATE INDEX idx_item_modifier_applications_item_id
  ON public.item_modifier_applications USING btree (item_id);

CREATE INDEX idx_item_modifier_applications_modifier_id
  ON public.item_modifier_applications USING btree (item_modifier_id);

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

ALTER FUNCTION public.replace_item_modifier_applications(p_item_id uuid, p_modifier_ids jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.replace_item_modifier_applications(p_item_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_item_modifier_applications(p_item_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_item_modifier_applications(p_item_id uuid, p_modifier_ids jsonb) TO service_role;


--------------------------------------------------------------------------------
-- TOOL MODIFIER APPLICATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tool_modifier_applications (
  tool_id uuid NOT NULL,
  tool_modifier_id uuid NOT NULL,
  CONSTRAINT tool_modifier_applications_pkey PRIMARY KEY (tool_id, tool_modifier_id),
  CONSTRAINT tool_modifier_applications_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.tools(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT tool_modifier_applications_modifier_id_fkey FOREIGN KEY (tool_modifier_id) REFERENCES public.tool_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.tool_modifier_applications OWNER TO postgres;
ALTER TABLE public.tool_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.tool_modifier_applications TO anon;
GRANT ALL ON TABLE public.tool_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.tool_modifier_applications TO service_role;

CREATE INDEX idx_tool_modifier_applications_tool_id
  ON public.tool_modifier_applications USING btree (tool_id);

CREATE INDEX idx_tool_modifier_applications_modifier_id
  ON public.tool_modifier_applications USING btree (tool_modifier_id);

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

ALTER FUNCTION public.replace_tool_modifier_applications(p_tool_id uuid, p_modifier_ids jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.replace_tool_modifier_applications(p_tool_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_tool_modifier_applications(p_tool_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_tool_modifier_applications(p_tool_id uuid, p_modifier_ids jsonb) TO service_role;


--------------------------------------------------------------------------------
-- WEAPON MODIFIER APPLICATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.weapon_modifier_applications (
  weapon_id uuid NOT NULL,
  weapon_modifier_id uuid NOT NULL,
  CONSTRAINT weapon_modifier_applications_pkey PRIMARY KEY (weapon_id, weapon_modifier_id),
  CONSTRAINT weapon_modifier_applications_weapon_id_fkey FOREIGN KEY (weapon_id) REFERENCES public.weapons(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT weapon_modifier_applications_modifier_id_fkey FOREIGN KEY (weapon_modifier_id) REFERENCES public.weapon_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.weapon_modifier_applications OWNER TO postgres;
ALTER TABLE public.weapon_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.weapon_modifier_applications TO anon;
GRANT ALL ON TABLE public.weapon_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.weapon_modifier_applications TO service_role;

CREATE INDEX idx_weapon_modifier_applications_weapon_id
  ON public.weapon_modifier_applications USING btree (weapon_id);

CREATE INDEX idx_weapon_modifier_applications_modifier_id
  ON public.weapon_modifier_applications USING btree (weapon_modifier_id);

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

ALTER FUNCTION public.replace_weapon_modifier_applications(p_weapon_id uuid, p_modifier_ids jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.replace_weapon_modifier_applications(p_weapon_id uuid, p_modifier_ids jsonb) TO anon;
GRANT ALL ON FUNCTION public.replace_weapon_modifier_applications(p_weapon_id uuid, p_modifier_ids jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.replace_weapon_modifier_applications(p_weapon_id uuid, p_modifier_ids jsonb) TO service_role;
