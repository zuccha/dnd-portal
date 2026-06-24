CREATE TABLE IF NOT EXISTS public.equipment_modifier_applications (
  equipment_id uuid NOT NULL,
  equipment_modifier_id uuid NOT NULL,
  CONSTRAINT equipment_modifier_applications_pkey PRIMARY KEY (equipment_id, equipment_modifier_id),
  CONSTRAINT equipment_modifier_applications_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipments(resource_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT equipment_modifier_applications_modifier_id_fkey FOREIGN KEY (equipment_modifier_id) REFERENCES public.equipment_modifiers(resource_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.equipment_modifier_applications ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.equipment_modifier_applications TO anon;
GRANT ALL ON TABLE public.equipment_modifier_applications TO authenticated;
GRANT ALL ON TABLE public.equipment_modifier_applications TO service_role;

CREATE INDEX idx_equipment_modifier_applications_equipment_id
  ON public.equipment_modifier_applications USING btree (equipment_id);

CREATE INDEX idx_equipment_modifier_applications_modifier_id
  ON public.equipment_modifier_applications USING btree (equipment_modifier_id);

CREATE POLICY "Users can read equipment modifier applications"
ON public.equipment_modifier_applications
FOR SELECT TO anon, authenticated
USING (
  public.can_read_resource(equipment_id)
  AND public.can_read_resource(equipment_modifier_id)
);

CREATE POLICY "Creators and GMs can create equipment modifier applications"
ON public.equipment_modifier_applications
FOR INSERT TO authenticated
WITH CHECK (
  public.can_edit_resource(equipment_id)
  OR public.can_edit_resource(equipment_modifier_id)
);

CREATE POLICY "Creators and GMs can delete equipment modifier applications"
ON public.equipment_modifier_applications
FOR DELETE TO authenticated
USING (
  public.can_edit_resource(equipment_id)
  OR public.can_edit_resource(equipment_modifier_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_type t ON t.typrelid = a.attrelid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'equipment_row'
      AND a.attname = 'modifier_ids'
      AND NOT a.attisdropped
  ) THEN
    ALTER TYPE public.equipment_row ADD ATTRIBUTE modifier_ids jsonb CASCADE;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_type t ON t.typrelid = a.attrelid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'equipment_modifier_row'
      AND a.attname = 'equipment_ids'
      AND NOT a.attisdropped
  ) THEN
    ALTER TYPE public.equipment_modifier_row ADD ATTRIBUTE equipment_ids jsonb CASCADE;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_type t ON t.typrelid = a.attrelid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'armor_row'
      AND a.attname = 'modifier_ids'
      AND NOT a.attisdropped
  ) THEN
    ALTER TYPE public.armor_row ADD ATTRIBUTE modifier_ids jsonb CASCADE;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_type t ON t.typrelid = a.attrelid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'item_row'
      AND a.attname = 'modifier_ids'
      AND NOT a.attisdropped
  ) THEN
    ALTER TYPE public.item_row ADD ATTRIBUTE modifier_ids jsonb CASCADE;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_type t ON t.typrelid = a.attrelid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'tool_row'
      AND a.attname = 'modifier_ids'
      AND NOT a.attisdropped
  ) THEN
    ALTER TYPE public.tool_row ADD ATTRIBUTE modifier_ids jsonb CASCADE;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_attribute a
    JOIN pg_type t ON t.typrelid = a.attrelid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'weapon_row'
      AND a.attname = 'modifier_ids'
      AND NOT a.attisdropped
  ) THEN
    ALTER TYPE public.weapon_row ADD ATTRIBUTE modifier_ids jsonb CASCADE;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.fetch_armor(p_id uuid)
RETURNS public.armor_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.source_id, e.source_code, e.source_version, e.id, e.kind, e.visibility,
    e.image_url, e.name, e.name_short, e.page,
    e.cost, e.magic, e.rarity, e.weight, e.feature_entries,
    a.armor_class_max_cha_modifier, a.armor_class_max_con_modifier,
    a.armor_class_max_dex_modifier, a.armor_class_max_int_modifier,
    a.armor_class_max_str_modifier, a.armor_class_max_wis_modifier,
    a.armor_class_modifier, a.base_armor_class, a.disadvantage_on_stealth,
    a.required_cha, a.required_con, a.required_dex,
    a.required_int, a.required_str, a.required_wis, a.type,
    e.notes, e.required_attunement_slots, e.attunement_notes, e.modifier_ids
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.armors a ON a.resource_id = e.id
  WHERE e.id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.fetch_armors(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.armor_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    (
      SELECT coalesce(array_agg((e.key)::public.armor_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.armor_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc
),
base AS (
  SELECT e.*
  FROM public.fetch_equipments(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS e
),
src AS (
  SELECT
    b.id, b.source_id, b.source_code, b.source_version, b.kind, b.visibility,
    b.image_url, b.name, b.name_short, b.page,
    b.notes, b.required_attunement_slots, b.attunement_notes, b.modifier_ids,
    b.feature_entries,
    a.armor_class_max_cha_modifier, a.armor_class_max_con_modifier,
    a.armor_class_max_dex_modifier, a.armor_class_max_int_modifier,
    a.armor_class_max_str_modifier, a.armor_class_max_wis_modifier,
    a.armor_class_modifier, a.base_armor_class, a.disadvantage_on_stealth,
    a.required_cha, a.required_con, a.required_dex,
    a.required_int, a.required_str, a.required_wis, a.type,
    e.cost, e.magic, e.rarity, e.weight
  FROM base b
  JOIN public.armors a ON a.resource_id = b.id
  JOIN public.equipments e ON e.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
)
SELECT
  f.source_id, f.source_code, f.source_version, f.id, f.kind, f.visibility,
  f.image_url, f.name, f.name_short, f.page,
  f.cost, f.magic, f.rarity, f.weight, f.feature_entries,
  f.armor_class_max_cha_modifier, f.armor_class_max_con_modifier,
  f.armor_class_max_dex_modifier, f.armor_class_max_int_modifier,
  f.armor_class_max_str_modifier, f.armor_class_max_wis_modifier,
  f.armor_class_modifier, f.base_armor_class, f.disadvantage_on_stealth,
  f.required_cha, f.required_con, f.required_dex,
  f.required_int, f.required_str, f.required_wis, f.type,
  f.notes, f.required_attunement_slots, f.attunement_notes, f.modifier_ids
FROM filtered f
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

CREATE OR REPLACE FUNCTION public.fetch_item(p_id uuid)
RETURNS public.item_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.source_id, e.source_code, e.source_version, e.id, e.kind, e.visibility,
    e.image_url, e.name, e.name_short, e.page,
    e.cost, e.magic, e.rarity, e.weight, e.feature_entries,
    i.type, i.charges, i.consumable,
    e.notes, e.required_attunement_slots, e.attunement_notes, e.modifier_ids
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.items i ON i.resource_id = e.id
  WHERE e.id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.fetch_items(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.item_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    (
      SELECT coalesce(array_agg((e.key)::public.item_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.item_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc
),
base AS (
  SELECT e.*
  FROM public.fetch_equipments(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS e
),
src AS (
  SELECT
    b.id, b.source_id, b.source_code, b.source_version, b.kind, b.visibility,
    b.image_url, b.name, b.name_short, b.page,
    b.cost, b.magic, b.rarity, b.weight, b.feature_entries,
    i.type, i.charges, i.consumable,
    b.notes, b.required_attunement_slots, b.attunement_notes, b.modifier_ids
  FROM base b
  JOIN public.items i ON i.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
)
SELECT
  s.source_id, s.source_code, s.source_version, s.id, s.kind, s.visibility,
  s.image_url, s.name, s.name_short, s.page,
  s.cost, s.magic, s.rarity, s.weight, s.feature_entries,
  s.type, s.charges, s.consumable,
  s.notes, s.required_attunement_slots, s.attunement_notes, s.modifier_ids
FROM filtered s
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

CREATE OR REPLACE FUNCTION public.fetch_tool(p_id uuid)
RETURNS public.tool_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.source_id, e.source_code, e.source_version, e.id, e.kind, e.visibility,
    e.image_url, e.name, e.name_short, e.page,
    e.cost, e.magic, e.rarity, e.weight, e.feature_entries, e.notes,
    t.ability, coalesce(tc.craft_ids, '{}'::uuid[]) AS craft_ids, t.type,
    coalesce(tt.utilize, '{}'::jsonb) AS utilize,
    e.required_attunement_slots, e.attunement_notes, e.modifier_ids
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.tools t ON t.resource_id = e.id
  LEFT JOIN (
    SELECT
      tc.tool_id AS id,
      array_agg(tc.equipment_id ORDER BY tc.equipment_id) AS craft_ids
    FROM public.tool_crafts tc
    WHERE tc.tool_id = p_id
    GROUP BY tc.tool_id
  ) tc ON tc.id = e.id
  LEFT JOIN (
    SELECT
      t.resource_id AS id,
      jsonb_object_agg(tt.lang, tt.utilize) AS utilize
    FROM public.tools t
    LEFT JOIN public.tool_translations tt ON tt.resource_id = t.resource_id
    WHERE t.resource_id = p_id
    GROUP BY t.resource_id
  ) tt ON tt.id = e.id
  WHERE e.id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.fetch_tools(
  p_source_id uuid,
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
  FROM public.fetch_equipments(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS e
),
src AS (
  SELECT
    b.id, b.source_id, b.source_code, b.source_version, b.kind, b.visibility,
    b.image_url, b.name, b.name_short, b.page,
    b.cost, b.magic, b.rarity, b.weight, b.feature_entries, b.notes,
    b.required_attunement_slots, b.attunement_notes, b.modifier_ids,
    t.ability, t.type
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
    jsonb_object_agg(t.lang, t.utilize) FILTER (WHERE array_length(p_langs,1) IS NULL OR t.lang = any(p_langs)) AS utilize
  FROM filtered f
  LEFT JOIN public.tool_translations t ON t.resource_id = f.id
  LEFT JOIN (SELECT 1) _ ON true
  GROUP BY f.id
),
tc AS (
  SELECT
    tc.tool_id AS id,
    array_agg(tc.equipment_id ORDER BY tc.equipment_id) AS craft_ids
  FROM public.tool_crafts tc
  GROUP BY tc.tool_id
)
SELECT
  f.source_id, f.source_code, f.source_version, f.id, f.kind, f.visibility,
  f.image_url, f.name, f.name_short, f.page,
  f.cost, f.magic, f.rarity, f.weight, f.feature_entries, f.notes,
  f.ability, coalesce(tc.craft_ids, '{}'::uuid[]) AS craft_ids, f.type,
  coalesce(tt.utilize, '{}'::jsonb) AS utilize,
  f.required_attunement_slots, f.attunement_notes, f.modifier_ids
FROM filtered f
LEFT JOIN tt ON tt.id = f.id
LEFT JOIN tc ON tc.id = f.id
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

CREATE OR REPLACE FUNCTION public.fetch_weapon(p_id uuid)
RETURNS public.weapon_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    e.source_id, e.source_code, e.source_version, e.id, e.kind, e.visibility,
    e.image_url, e.name, e.name_short, e.page,
    e.cost, e.magic, e.rarity, e.weight, e.feature_entries,
    w.damage, w.damage_type, w.damage_versatile, w.mastery, w.melee,
    w.properties, w.range_long, w.range_short, w.ranged, w.type,
    coalesce(wa.ammunition_ids, '{}'::uuid[]) AS ammunition_ids,
    e.notes, e.required_attunement_slots, e.attunement_notes, e.modifier_ids
  FROM public.fetch_equipment(p_id) AS e
  JOIN public.weapons w ON w.resource_id = e.id
  LEFT JOIN (
    SELECT
      wa.weapon_id AS id,
      array_agg(wa.equipment_id ORDER BY wa.equipment_id) AS ammunition_ids
    FROM public.weapon_ammunitions wa
    WHERE wa.weapon_id = p_id
    GROUP BY wa.weapon_id
  ) wa ON wa.id = e.id
  WHERE e.id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.fetch_weapons(
  p_source_id uuid,
  p_langs text[],
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_order_by text DEFAULT 'name'::text,
  p_order_dir text DEFAULT 'asc'::text)
RETURNS SETOF public.weapon_row
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
WITH prefs AS (
  SELECT
    (
      SELECT coalesce(array_agg((e.key)::public.weapon_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'true'
    ) AS types_inc,
    (
      SELECT coalesce(array_agg((e.key)::public.weapon_type), null)
      FROM jsonb_each_text(p_filters->'types') AS e(key, value)
      WHERE e.value = 'false'
    ) AS types_exc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      FROM jsonb_each_text(p_filters->'properties') AS e(key, value)
      WHERE e.value = 'true'
    ) AS properties_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_property), null)
      FROM jsonb_each_text(p_filters->'properties') AS e(key, value)
      WHERE e.value = 'false'
    ) AS properties_exc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      FROM jsonb_each_text(p_filters->'masteries') AS e(key, value)
      WHERE e.value = 'true'
    ) AS masteries_inc,
    (
      SELECT coalesce(array_agg(lower(e.key)::public.weapon_mastery), null)
      FROM jsonb_each_text(p_filters->'masteries') AS e(key, value)
      WHERE e.value = 'false'
    ) AS masteries_exc,
    (p_filters ? 'melee')::int::boolean AS has_melee_filter,
    (p_filters->>'melee')::boolean AS melee_val,
    (p_filters ? 'ranged')::int::boolean AS has_ranged_filter,
    (p_filters->>'ranged')::boolean AS ranged_val
),
base AS (
  SELECT e.*
  FROM public.fetch_equipments(p_source_id, p_langs, p_filters, p_order_by, p_order_dir) AS e
),
src AS (
  SELECT
    b.id, b.source_id, b.source_code, b.source_version, b.kind, b.visibility,
    b.image_url, b.name, b.name_short, b.page,
    b.cost, b.magic, b.rarity, b.weight, b.feature_entries,
    b.notes, b.required_attunement_slots, b.attunement_notes, b.modifier_ids,
    w.type, w.damage, w.damage_type, w.damage_versatile, w.mastery,
    w.properties, w.melee, w.ranged, w.range_long, w.range_short
  FROM base b
  JOIN public.weapons w ON w.resource_id = b.id
),
filtered AS (
  SELECT s.*
  FROM src s, prefs p
  WHERE
        (p.types_inc IS NULL OR s.type = any(p.types_inc))
    AND (p.types_exc IS NULL OR NOT (s.type = any(p.types_exc)))
    AND (p.properties_inc IS NULL OR s.properties && p.properties_inc)
    AND (p.properties_exc IS NULL OR NOT (s.properties && p.properties_exc))
    AND (p.masteries_inc IS NULL OR s.mastery = any(p.masteries_inc))
    AND (p.masteries_exc IS NULL OR NOT (s.mastery = any(p.masteries_exc)))
    AND (NOT p.has_melee_filter OR s.melee = p.melee_val)
    AND (NOT p.has_ranged_filter OR s.ranged = p.ranged_val)
),
wa AS (
  SELECT
    wa.weapon_id AS id,
    array_agg(wa.equipment_id ORDER BY wa.equipment_id) AS ammunition_ids
  FROM public.weapon_ammunitions wa
  GROUP BY wa.weapon_id
)
SELECT
  f.source_id, f.source_code, f.source_version, f.id, f.kind, f.visibility,
  f.image_url, f.name, f.name_short, f.page,
  f.cost, f.magic, f.rarity, f.weight, f.feature_entries,
  f.damage, f.damage_type, f.damage_versatile, f.mastery, f.melee,
  f.properties, f.range_long, f.range_short, f.ranged, f.type,
  coalesce(wa.ammunition_ids, '{}'::uuid[]) AS ammunition_ids,
  f.notes, f.required_attunement_slots, f.attunement_notes, f.modifier_ids
FROM filtered f
LEFT JOIN wa ON wa.id = f.id
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

  INSERT INTO public.equipment_modifier_applications (equipment_id, equipment_modifier_id)
  SELECT
    v_id,
    (value)::uuid
  FROM jsonb_array_elements_text(
    coalesce(p_equipment->'modifier_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.equipment_modifier_applications ema
    WHERE ema.equipment_id = v_id
      AND ema.equipment_modifier_id = (v.value)::uuid
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
      ema.equipment_id AS id,
      jsonb_agg(ema.equipment_modifier_id ORDER BY ema.equipment_modifier_id) AS modifier_ids
    FROM public.equipment_modifier_applications ema
    WHERE ema.equipment_id = p_id
    GROUP BY ema.equipment_id
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
    (p_filters ? 'magic')::int::boolean   AS has_magic_filter,
    (p_filters->>'magic')::boolean        AS magic_val,
    (p_filters ? 'requires_attunement')::int::boolean AS has_attunement_filter,
    (p_filters->>'requires_attunement')::boolean      AS attunement_val,
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
    jsonb_agg(ema.equipment_modifier_id ORDER BY ema.equipment_modifier_id) FILTER (WHERE ema.equipment_modifier_id IS NOT NULL) AS modifier_ids
  FROM filtered f
  LEFT JOIN public.equipment_modifier_applications ema ON ema.equipment_id = f.id
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

  IF p_equipment ? 'modifier_ids' THEN
    WITH entries AS (
      SELECT
        (value)::uuid AS equipment_modifier_id
      FROM jsonb_array_elements_text(
        coalesce(p_equipment->'modifier_ids', '[]'::jsonb)
      )
    )
    DELETE FROM public.equipment_modifier_applications ema
    WHERE ema.equipment_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM entries e
        WHERE e.equipment_modifier_id = ema.equipment_modifier_id
      );

    WITH entries AS (
      SELECT
        (value)::uuid AS equipment_modifier_id
      FROM jsonb_array_elements_text(
        coalesce(p_equipment->'modifier_ids', '[]'::jsonb)
      )
    )
    INSERT INTO public.equipment_modifier_applications (equipment_id, equipment_modifier_id)
    SELECT
      p_id,
      e.equipment_modifier_id
    FROM (
      SELECT DISTINCT equipment_modifier_id FROM entries
    ) e
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment_modifier_applications ema
      WHERE ema.equipment_id = p_id
        AND ema.equipment_modifier_id = e.equipment_modifier_id
    );
  END IF;

  perform public.upsert_equipment_translation(p_id, p_lang, p_equipment_translation);
END;
$$;

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

  INSERT INTO public.equipment_modifier_applications (equipment_id, equipment_modifier_id)
  SELECT
    (value)::uuid,
    v_id
  FROM jsonb_array_elements_text(
    coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)
  ) v
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.equipment_modifier_applications ema
    WHERE ema.equipment_id = (v.value)::uuid
      AND ema.equipment_modifier_id = v_id
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
      ema.equipment_modifier_id AS id,
      jsonb_agg(ema.equipment_id ORDER BY ema.equipment_id) AS equipment_ids
    FROM public.equipment_modifier_applications ema
    WHERE ema.equipment_modifier_id = p_id
    GROUP BY ema.equipment_modifier_id
  ) ee ON ee.id = r.id
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
    em.weight_delta,
    coalesce(ee.equipment_ids, '[]'::jsonb) AS equipment_ids
  FROM base b
  JOIN public.equipment_modifiers em ON em.resource_id = b.id
  LEFT JOIN (
    SELECT
      ema.equipment_modifier_id AS id,
      jsonb_agg(ema.equipment_id ORDER BY ema.equipment_id) AS equipment_ids
    FROM public.equipment_modifier_applications ema
    GROUP BY ema.equipment_modifier_id
  ) ee ON ee.id = b.id
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
    WITH entries AS (
      SELECT
        (value)::uuid AS equipment_id
      FROM jsonb_array_elements_text(
        coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)
      )
    )
    DELETE FROM public.equipment_modifier_applications ema
    WHERE ema.equipment_modifier_id = p_id
      AND NOT EXISTS (
        SELECT 1
        FROM entries e
        WHERE e.equipment_id = ema.equipment_id
      );

    WITH entries AS (
      SELECT
        (value)::uuid AS equipment_id
      FROM jsonb_array_elements_text(
        coalesce(p_equipment_modifier->'equipment_ids', '[]'::jsonb)
      )
    )
    INSERT INTO public.equipment_modifier_applications (equipment_id, equipment_modifier_id)
    SELECT
      e.equipment_id,
      p_id
    FROM (
      SELECT DISTINCT equipment_id FROM entries
    ) e
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment_modifier_applications ema
      WHERE ema.equipment_id = e.equipment_id
        AND ema.equipment_modifier_id = p_id
    );
  END IF;

  perform public.upsert_equipment_modifier_translation(
    p_id,
    p_lang,
    p_equipment_modifier_translation
  );
END;
$$;
