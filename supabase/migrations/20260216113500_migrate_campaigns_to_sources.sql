-- Migrate campaigns/modules to sources

-- Temporarily disable role/ownership enforcement triggers for bulk migration
ALTER TABLE public.sources DISABLE TRIGGER enforce_source_creator_roles;
ALTER TABLE public.source_roles DISABLE TRIGGER validate_source_role_write;
ALTER TABLE public.source_roles DISABLE TRIGGER validate_source_role_delete;
ALTER TABLE public.source_ownerships DISABLE TRIGGER validate_source_ownership_write;
ALTER TABLE public.source_ownerships DISABLE TRIGGER validate_source_ownership_delete;
ALTER TABLE public.source_ownerships DISABLE TRIGGER validate_source_ownership_update;

-- 1) campaigns -> sources
INSERT INTO public.sources (id, created_at, code, creator_id, visibility)
SELECT
  c.id,
  now(),
  c.name,
  c.creator_id,
  c.visibility::text::public.source_visibility
FROM public.campaigns c
ON CONFLICT (id) DO NOTHING;

-- 2) campaign_modules -> source_includes
INSERT INTO public.source_includes (source_id, include_id, added_at)
SELECT
  cm.campaign_id,
  cm.module_id,
  cm.added_at
FROM public.campaign_modules cm
ON CONFLICT (source_id, include_id) DO NOTHING;

-- 3) module_dependencies -> source_requires
INSERT INTO public.source_requires (source_id, required_id, added_at)
SELECT
  md.module_id,
  md.dependency_id,
  md.added_at
FROM public.module_dependencies md
ON CONFLICT (source_id, required_id) DO NOTHING;

-- 4) user_modules: owner -> guest, creator -> owner
INSERT INTO public.source_ownerships (user_id, source_id, role, acquired_at)
SELECT
  um.user_id,
  um.module_id,
  CASE
    WHEN um.role = 'creator'::public.module_role THEN 'owner'::public.source_ownership
    ELSE 'guest'::public.source_ownership
  END,
  um.acquired_at
FROM public.user_modules um
ON CONFLICT (user_id, source_id) DO UPDATE
SET role = CASE
  WHEN public.source_ownerships.role = 'owner'::public.source_ownership
    THEN public.source_ownerships.role
  ELSE excluded.role
END;

-- 5) campaign_players: game_master -> owner + editor (players ignored)
INSERT INTO public.source_ownerships (user_id, source_id, role, acquired_at)
SELECT
  cp.user_id,
  cp.campaign_id,
  'owner'::public.source_ownership,
  cp.created_at
FROM public.campaign_players cp
WHERE cp.role = 'game_master'::public.campaign_role
ON CONFLICT (user_id, source_id) DO UPDATE
SET role = CASE
  WHEN public.source_ownerships.role = 'owner'::public.source_ownership
    THEN public.source_ownerships.role
  ELSE excluded.role
END;

INSERT INTO public.source_roles (user_id, source_id, role, assigned_at)
SELECT
  cp.user_id,
  cp.campaign_id,
  'editor'::public.source_role,
  cp.created_at
FROM public.campaign_players cp
WHERE cp.role = 'game_master'::public.campaign_role
ON CONFLICT (user_id, source_id) DO UPDATE
SET role = CASE
  WHEN public.source_roles.role = 'admin'::public.source_role
    THEN public.source_roles.role
  ELSE excluded.role
END;

-- Re-enable enforcement triggers
ALTER TABLE public.sources ENABLE TRIGGER enforce_source_creator_roles;
ALTER TABLE public.source_roles ENABLE TRIGGER validate_source_role_write;
ALTER TABLE public.source_roles ENABLE TRIGGER validate_source_role_delete;
ALTER TABLE public.source_ownerships ENABLE TRIGGER validate_source_ownership_write;
ALTER TABLE public.source_ownerships ENABLE TRIGGER validate_source_ownership_delete;
ALTER TABLE public.source_ownerships ENABLE TRIGGER validate_source_ownership_update;
