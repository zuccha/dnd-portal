WITH params AS (
  SELECT
    'de28681a-d648-4bc5-9c1f-c73938e36588'::uuid AS source_id,
    NULL::text[] AS langs,
    '{}'::jsonb AS filters
),
source AS (
  SELECT jsonb_build_object(
    'id', s.id,
    'code', s.code,
    'sync_version', s.sync_version,
    'type', s.type,
    'version', s.version,
    'name', coalesce(st.name, '{}'::jsonb),
    'include_ids', coalesce(si.include_ids, '[]'::jsonb),
    'required_ids', coalesce(sr.required_ids, '[]'::jsonb)
  ) AS data
  FROM params p
  JOIN public.sources s ON s.id = p.source_id
  LEFT JOIN (
    SELECT source_id, jsonb_object_agg(lang, name) AS name
    FROM public.source_translations
    GROUP BY source_id
  ) st ON st.source_id = s.id
  LEFT JOIN (
    SELECT source_id, jsonb_agg(include_id) AS include_ids
    FROM public.source_includes
    GROUP BY source_id
  ) si ON si.source_id = s.id
  LEFT JOIN (
    SELECT source_id, jsonb_agg(required_id) AS required_ids
    FROM public.source_requires
    GROUP BY source_id
  ) sr ON sr.source_id = s.id
)
SELECT jsonb_pretty(
  jsonb_build_object(
    'source', (SELECT data FROM source),
    'resources', jsonb_build_object(
      'backgrounds', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_backgrounds((SELECT
      source_id FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE
      r.source_id = (SELECT source_id FROM params)), '[]'::jsonb),
      'character_classes', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM
      public.fetch_character_classes((SELECT source_id FROM params), (SELECT langs FROM params), (SELECT
      filters FROM params)) r WHERE r.source_id = (SELECT source_id FROM params)), '[]'::jsonb),
      'character_subclasses', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM
      public.fetch_character_subclasses((SELECT source_id FROM params), (SELECT langs FROM params),
      (SELECT filters FROM params)) r WHERE r.source_id = (SELECT source_id FROM params)), '[]'::jsonb),
      'creature_tags', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_creature_tags((SELECT
      source_id FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE
      r.source_id = (SELECT source_id FROM params)), '[]'::jsonb),
      'creatures', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_creatures((SELECT source_id
      FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id =
      (SELECT source_id FROM params)), '[]'::jsonb),
      'eldritch_invocations', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM
      public.fetch_eldritch_invocations((SELECT source_id FROM params), (SELECT langs FROM params),
      (SELECT filters FROM params)) r WHERE r.source_id = (SELECT source_id FROM params)), '[]'::jsonb),
      'armors', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_armors((SELECT source_id FROM
      params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id = (SELECT
      source_id FROM params)), '[]'::jsonb),
      'items', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_items((SELECT source_id FROM
      params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id = (SELECT
      source_id FROM params)), '[]'::jsonb),
      'tools', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_tools((SELECT source_id FROM
      params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id = (SELECT
      source_id FROM params)), '[]'::jsonb),
      'weapons', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_weapons((SELECT source_id
      FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id =
      (SELECT source_id FROM params)), '[]'::jsonb),
      'armor_modifiers', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM
      public.fetch_armor_modifiers((SELECT source_id FROM params), (SELECT langs FROM params), (SELECT
      filters FROM params)) r WHERE r.source_id = (SELECT source_id FROM params)), '[]'::jsonb),
      'item_modifiers', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_item_modifiers((SELECT
      source_id FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE
      r.source_id = (SELECT source_id FROM params)), '[]'::jsonb),
      'tool_modifiers', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_tool_modifiers((SELECT
      source_id FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE
      r.source_id = (SELECT source_id FROM params)), '[]'::jsonb),
      'weapon_modifiers', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM
      public.fetch_weapon_modifiers((SELECT source_id FROM params), (SELECT langs FROM params), (SELECT
      filters FROM params)) r WHERE r.source_id = (SELECT source_id FROM params)), '[]'::jsonb),
      'feats', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_feats((SELECT source_id FROM
      params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id = (SELECT
      source_id FROM params)), '[]'::jsonb),
      'features', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_features((SELECT source_id
      FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id =
      (SELECT source_id FROM params)), '[]'::jsonb),
      'languages', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_languages((SELECT source_id
      FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id =
      (SELECT source_id FROM params)), '[]'::jsonb),
      'maneuvers', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_maneuvers((SELECT source_id
      FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id =
      (SELECT source_id FROM params)), '[]'::jsonb),
      'metamagics', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_metamagics((SELECT
      source_id FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE
      r.source_id = (SELECT source_id FROM params)), '[]'::jsonb),
      'planes', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_planes((SELECT source_id FROM
      params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id = (SELECT
      source_id FROM params)), '[]'::jsonb),
      'services', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_services((SELECT source_id
      FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id =
      (SELECT source_id FROM params)), '[]'::jsonb),
      'species', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_species((SELECT source_id
      FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id =
      (SELECT source_id FROM params)), '[]'::jsonb),
      'spells', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_spells((SELECT source_id FROM
      params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id = (SELECT
      source_id FROM params)), '[]'::jsonb),
      'vehicles', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM public.fetch_vehicles((SELECT source_id
      FROM params), (SELECT langs FROM params), (SELECT filters FROM params)) r WHERE r.source_id =
      (SELECT source_id FROM params)), '[]'::jsonb)
    )
  )
) AS source_bundle;