--------------------------------------------------------------------------------
-- ITEM ROW
--------------------------------------------------------------------------------

CREATE TYPE public.item_row AS (
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
  rarity public.equipment_rarity,
  weight integer,
  -- Item Translation
  notes jsonb
);


--------------------------------------------------------------------------------
-- CREATE ITEM
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_item(
  p_campaign_id uuid,
  p_lang text,
  p_item jsonb,
  p_item_translation jsonb)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id uuid;
BEGIN
  v_id := public.create_equipment(
    p_campaign_id,
    p_lang,
    p_item || jsonb_build_object('kind', 'item'::public.resource_kind),
    p_item_translation
  );

  INSERT INTO public.items (resource_id)
  VALUES (v_id);

  perform public.upsert_item_translation(v_id, p_lang, p_item_translation);

  RETURN v_id;
END;
$$;

ALTER FUNCTION public.create_item(p_campaign_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.create_item(p_campaign_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.create_item(p_campaign_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.create_item(p_campaign_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ITEM
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_item(p_id uuid)
RETURNS public.item_row
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
    e.rarity,
    e.weight,
    e.notes
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.items i ON i.resource_id = e.id
  WHERE e.id = p_id;
$$;

ALTER FUNCTION public.fetch_item(p_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_item(p_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_item(p_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_item(p_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH ITEMS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_items(
  p_campaign_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.item_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH base AS (
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
    b.rarity,
    b.weight,
    b.notes
  FROM base b
  JOIN public.items i ON i.resource_id = b.id
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
  s.rarity,
  s.weight,
  s.notes
FROM src s
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

ALTER FUNCTION public.fetch_items(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_items(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO anon;
GRANT ALL ON FUNCTION public.fetch_items(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_items(p_campaign_id uuid, p_langs text[], p_filters jsonb, p_order_by text, p_order_dir text) TO service_role;


--------------------------------------------------------------------------------
-- UPSERT ITEM TRANSLATION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_item_translation(
  p_id uuid,
  p_lang text,
  p_item_translation jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
BEGIN
  INSERT INTO public.item_translations AS it (resource_id, lang)
  VALUES (p_id, p_lang)
  ON conflict (resource_id, lang) DO NOTHING;

  perform public.upsert_resource_translation(p_id, p_lang, p_item_translation);
  perform public.upsert_equipment_translation(p_id, p_lang, p_item_translation);
END;
$$;

ALTER FUNCTION public.upsert_item_translation(p_id uuid, p_lang text, p_item_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.upsert_item_translation(p_id uuid, p_lang text, p_item_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.upsert_item_translation(p_id uuid, p_lang text, p_item_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.upsert_item_translation(p_id uuid, p_lang text, p_item_translation jsonb) TO service_role;


--------------------------------------------------------------------------------
-- UPDATE ITEM
--------------------------------------------------------------------------------

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
  SET resource_id = i.resource_id
  WHERE i.resource_id = p_id;

  GET diagnostics v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    raise exception 'No row with id %', p_id;
  END IF;

  perform public.upsert_item_translation(p_id, p_lang, p_item_translation);
END;
$$;

ALTER FUNCTION public.update_item(p_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) OWNER TO postgres;

GRANT ALL ON FUNCTION public.update_item(p_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO anon;
GRANT ALL ON FUNCTION public.update_item(p_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.update_item(p_id uuid, p_lang text, p_item jsonb, p_item_translation jsonb) TO service_role;
