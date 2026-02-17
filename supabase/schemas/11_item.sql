--------------------------------------------------------------------------------
-- ITEMS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.items (
  resource_id uuid NOT NULL,
  type public.item_type DEFAULT 'other'::public.item_type NOT NULL,
  charges integer,
  consumable boolean DEFAULT false NOT NULL,
  CONSTRAINT items_pkey PRIMARY KEY (resource_id),
  CONSTRAINT items_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT items_charges_non_negative CHECK (charges IS NULL OR charges >= 0)
);

ALTER TABLE public.items OWNER TO postgres;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.items TO anon;
GRANT ALL ON TABLE public.items TO authenticated;
GRANT ALL ON TABLE public.items TO service_role;


--------------------------------------------------------------------------------
-- ITEM TRANSLATIONS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.item_translations (
  resource_id uuid NOT NULL,
  lang text NOT NULL,
  CONSTRAINT item_translations_pkey PRIMARY KEY (resource_id, lang),
  CONSTRAINT item_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.items(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT item_translations_lang_fkey FOREIGN KEY (lang) REFERENCES public.langs(code) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.item_translations OWNER TO postgres;
ALTER TABLE public.item_translations ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.item_translations TO anon;
GRANT ALL ON TABLE public.item_translations TO authenticated;
GRANT ALL ON TABLE public.item_translations TO service_role;


--------------------------------------------------------------------------------
-- ITEMS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read items"
ON public.items
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new items"
ON public.items
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update items"
ON public.items
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete items"
ON public.items
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));


--------------------------------------------------------------------------------
-- ITEM TRANSLATIONS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read item translations"
ON public.item_translations
FOR SELECT TO anon, authenticated
USING (public.can_read_resource(resource_id));

CREATE POLICY "Creators and GMs can create new item translations"
ON public.item_translations
FOR INSERT TO authenticated
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can update item translations"
ON public.item_translations
FOR UPDATE TO authenticated
USING (public.can_edit_resource(resource_id))
WITH CHECK (public.can_edit_resource(resource_id));

CREATE POLICY "Creators and GMs can delete item translations"
ON public.item_translations
FOR DELETE TO authenticated
USING (public.can_edit_resource(resource_id));
