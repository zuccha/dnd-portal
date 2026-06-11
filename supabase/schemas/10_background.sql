--------------------------------------------------------------------------------
-- BACKGROUNDS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.backgrounds (
  resource_id uuid NOT NULL,
  ability_scores public.creature_ability[] NOT NULL,
  feat_id uuid,
  skill_proficiencies public.creature_skill[] NOT NULL,
  tool_proficiency_id uuid,
  CONSTRAINT backgrounds_pkey PRIMARY KEY (resource_id),
  CONSTRAINT backgrounds_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT backgrounds_feat_id_fkey FOREIGN KEY (feat_id) REFERENCES public.feats(resource_id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT backgrounds_tool_proficiency_id_fkey FOREIGN KEY (tool_proficiency_id) REFERENCES public.tools(resource_id) ON UPDATE CASCADE ON DELETE SET NULL
);

ALTER TABLE public.backgrounds OWNER TO postgres;
ALTER TABLE public.backgrounds ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.backgrounds TO anon;
GRANT ALL ON TABLE public.backgrounds TO authenticated;
GRANT ALL ON TABLE public.backgrounds TO service_role;

CREATE INDEX idx_backgrounds_feat_id ON public.backgrounds USING btree (feat_id);
CREATE INDEX idx_backgrounds_tool_proficiency_id ON public.backgrounds USING btree (tool_proficiency_id);


--------------------------------------------------------------------------------
-- BACKGROUND RESOURCE KIND VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_background_resource_kind()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.resources r
    WHERE r.id = NEW.resource_id
      AND r.kind = 'background'::public.resource_kind
  ) THEN
    RAISE EXCEPTION 'Referenced resource % is not a background', NEW.resource_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_background_resource_kind() OWNER TO postgres;

CREATE TRIGGER enforce_background_resource_kind
  BEFORE INSERT OR UPDATE ON public.backgrounds
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_background_resource_kind();

GRANT ALL ON FUNCTION public.validate_background_resource_kind() TO anon;
GRANT ALL ON FUNCTION public.validate_background_resource_kind() TO authenticated;
GRANT ALL ON FUNCTION public.validate_background_resource_kind() TO service_role;


--------------------------------------------------------------------------------
-- BACKGROUNDS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read backgrounds"
ON public.backgrounds
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(resource_id)
  AND (feat_id IS NULL OR public.can_read_resource(feat_id))
  AND (tool_proficiency_id IS NULL OR public.can_read_resource(tool_proficiency_id))
);

CREATE POLICY "Creators and GMs can create new backgrounds"
ON public.backgrounds
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(resource_id)
  AND (feat_id IS NULL OR public.can_read_resource(feat_id))
  AND (tool_proficiency_id IS NULL OR public.can_read_resource(tool_proficiency_id))
);

CREATE POLICY "Creators and GMs can update backgrounds"
ON public.backgrounds
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (
  public.can_edit_resource(resource_id)
  AND (feat_id IS NULL OR public.can_read_resource(feat_id))
  AND (tool_proficiency_id IS NULL OR public.can_read_resource(tool_proficiency_id))
);

CREATE POLICY "Creators and GMs can delete backgrounds"
ON public.backgrounds
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

