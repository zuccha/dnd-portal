--------------------------------------------------------------------------------
-- ARMORS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.armors (
  resource_id uuid NOT NULL,
  armor_class_max_cha_modifier smallint DEFAULT '0'::integer,
  armor_class_max_con_modifier smallint DEFAULT '0'::integer,
  armor_class_max_dex_modifier smallint DEFAULT '0'::integer,
  armor_class_max_int_modifier smallint DEFAULT '0'::integer,
  armor_class_max_str_modifier smallint DEFAULT '0'::integer,
  armor_class_max_wis_modifier smallint DEFAULT '0'::integer,
  armor_class_modifier smallint DEFAULT '0'::integer NOT NULL,
  base_armor_class smallint DEFAULT '0'::integer NOT NULL,
  disadvantage_on_stealth boolean DEFAULT 'false'::boolean NOT NULL,
  required_cha smallint DEFAULT '0'::integer NOT NULL,
  required_con smallint DEFAULT '0'::integer NOT NULL,
  required_dex smallint DEFAULT '0'::integer NOT NULL,
  required_int smallint DEFAULT '0'::integer NOT NULL,
  required_str smallint DEFAULT '0'::integer NOT NULL,
  required_wis smallint DEFAULT '0'::integer NOT NULL,
  type public.armor_type NOT NULL,
  CONSTRAINT armors_pkey PRIMARY KEY (resource_id),
  CONSTRAINT armors_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.armors OWNER TO postgres;
ALTER TABLE public.armors ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.armors TO anon;
GRANT ALL ON TABLE public.armors TO authenticated;
GRANT ALL ON TABLE public.armors TO service_role;


--------------------------------------------------------------------------------
-- ARMOR TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.armor_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT armor_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT armor_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.armors(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT armor_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.armor_translations OWNER TO postgres;
ALTER TABLE public.armor_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.armor_translations TO anon;
GRANT ALL ON TABLE public.armor_translations TO authenticated;
GRANT ALL ON TABLE public.armor_translations TO service_role;


--------------------------------------------------------------------------------
-- ARMORS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read armors"
ON public.armors
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new armors"
ON public.armors
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update armors"
ON public.armors
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete armors"
ON public.armors
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- ARMOR TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read armor translations"
ON public.armor_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new armor translations"
ON public.armor_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update armor translations"
ON public.armor_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete armor translations"
ON public.armor_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));

