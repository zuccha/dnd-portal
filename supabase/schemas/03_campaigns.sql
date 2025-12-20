--------------------------------------------------------------------------------
-- CAMPAIGNS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    is_module boolean DEFAULT false NOT NULL,
    visibility public.campaign_visibility DEFAULT 'private'::public.campaign_visibility NOT NULL,
    CONSTRAINT campaign_pkey PRIMARY KEY (id)
);

ALTER TABLE public.campaigns OWNER TO postgres;

CREATE INDEX idx_campaigns_creator_id ON public.campaigns USING btree (creator_id);
CREATE INDEX idx_campaigns_is_module ON public.campaigns USING btree (is_module) WHERE is_module = true;

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.campaigns TO anon;
GRANT ALL ON TABLE public.campaigns TO authenticated;
GRANT ALL ON TABLE public.campaigns TO service_role;


--------------------------------------------------------------------------------
-- CAMPAIGN MODULES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.campaign_modules (
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    module_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    added_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT campaign_modules_pkey PRIMARY KEY (campaign_id, module_id)
);

ALTER TABLE public.campaign_modules OWNER TO postgres;

CREATE INDEX idx_campaign_modules_campaign_id ON public.campaign_modules USING btree (campaign_id);
CREATE INDEX idx_campaign_modules_module_id ON public.campaign_modules USING btree (module_id);

ALTER TABLE public.campaign_modules ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.campaign_modules TO anon;
GRANT ALL ON TABLE public.campaign_modules TO authenticated;
GRANT ALL ON TABLE public.campaign_modules TO service_role;


--------------------------------------------------------------------------------
-- CAMPAIGN PLAYERS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.campaign_players (
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    campaign_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    role public.campaign_role DEFAULT 'player'::public.campaign_role NOT NULL,
    CONSTRAINT campaign_players_pkey PRIMARY KEY (campaign_id, user_id),
    CONSTRAINT campaign_players_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT campaign_players_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE public.campaign_players OWNER TO postgres;

CREATE INDEX idx_campaign_players_user_id ON public.campaign_players USING btree (user_id);

ALTER TABLE public.campaign_players ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.campaign_players TO anon;
GRANT ALL ON TABLE public.campaign_players TO authenticated;
GRANT ALL ON TABLE public.campaign_players TO service_role;


--------------------------------------------------------------------------------
-- USER MODULES
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_modules (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    role public.module_role NOT NULL,
    acquired_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_modules_pkey PRIMARY KEY (user_id, module_id)
);

ALTER TABLE public.user_modules OWNER TO postgres;

CREATE INDEX idx_user_modules_user_id ON public.user_modules USING btree (user_id);
CREATE INDEX idx_user_modules_module_id ON public.user_modules USING btree (module_id);

ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.user_modules TO anon;
GRANT ALL ON TABLE public.user_modules TO authenticated;
GRANT ALL ON TABLE public.user_modules TO service_role;


--------------------------------------------------------------------------------
-- CAMPAIGNS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can read campaigns and modules" ON public.campaigns
FOR SELECT TO authenticated
USING (
  -- Modules: public/purchasable OR owned
  (is_module = true AND (
    visibility IN ('public'::public.campaign_visibility, 'purchasable'::public.campaign_visibility)
    OR EXISTS (
      SELECT 1 FROM public.user_modules um
      WHERE um.module_id = campaigns.id
        AND um.user_id = (SELECT auth.uid() AS uid)
    )
  ))
  OR
  -- Regular campaigns: participating
  (is_module = false AND EXISTS (
    SELECT 1 FROM public.campaign_players cp
    WHERE cp.campaign_id = campaigns.id
      AND cp.user_id = (SELECT auth.uid() AS uid)
  ))
);

CREATE POLICY "Campaign creators can edit" ON public.campaigns
TO authenticated
USING (creator_id = (SELECT auth.uid() AS uid));


--------------------------------------------------------------------------------
-- CAMPAIGN MODULES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Players can view modules used by campaigns they joined" ON public.campaign_modules
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaign_players cp
    WHERE cp.campaign_id = campaign_modules.campaign_id
      AND cp.user_id = (SELECT auth.uid() AS uid)
  )
);

CREATE POLICY "DMs can add modules to campaigns" ON public.campaign_modules
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaign_players cp
    WHERE cp.campaign_id = campaign_modules.campaign_id
      AND cp.user_id = (SELECT auth.uid() AS uid)
      AND cp.role = 'game_master'::public.campaign_role
  )
);

CREATE POLICY "DMs can remove modules from campaigns" ON public.campaign_modules
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaign_players cp
    WHERE cp.campaign_id = campaign_modules.campaign_id
      AND cp.user_id = (SELECT auth.uid() AS uid)
      AND cp.role = 'game_master'::public.campaign_role
  )
);


--------------------------------------------------------------------------------
-- CAMPAIGN PLAYERS POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can view their campaign memberships" ON public.campaign_players
FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid() AS uid)
);

DROP POLICY IF EXISTS "Campaign creators can manage memberships" ON public.campaign_players;
CREATE POLICY "Campaign creators can manage memberships" ON public.campaign_players
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_players.campaign_id
      AND c.creator_id = (SELECT auth.uid() AS uid)
  )
);

DROP POLICY IF EXISTS "Campaign creators can manage memberships" ON public.campaign_players;
CREATE POLICY "Campaign creators can manage memberships" ON public.campaign_players
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_players.campaign_id
      AND c.creator_id = (SELECT auth.uid() AS uid)
  )
);

DROP POLICY IF EXISTS "Campaign creators can manage memberships" ON public.campaign_players;
CREATE POLICY "Campaign creators can manage memberships" ON public.campaign_players
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_players.campaign_id
      AND c.creator_id = (SELECT auth.uid() AS uid)
  )
);


--------------------------------------------------------------------------------
-- USER MODULES POLICIES
--------------------------------------------------------------------------------

CREATE POLICY "Users can view their own module ownership" ON public.user_modules
FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid() AS uid)
);

DROP POLICY IF EXISTS "Module creators can manage ownership" ON public.user_modules;
CREATE POLICY "Module creators can manage ownership" ON public.user_modules
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = user_modules.module_id
      AND c.creator_id = (SELECT auth.uid() AS uid)
      AND c.is_module = true
  )
);

DROP POLICY IF EXISTS "Module creators can manage ownership" ON public.user_modules;
CREATE POLICY "Module creators can manage ownership" ON public.user_modules
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = user_modules.module_id
      AND c.creator_id = (SELECT auth.uid() AS uid)
      AND c.is_module = true
  )
);

DROP POLICY IF EXISTS "Module creators can manage ownership" ON public.user_modules;
CREATE POLICY "Module creators can manage ownership" ON public.user_modules
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = user_modules.module_id
      AND c.creator_id = (SELECT auth.uid() AS uid)
      AND c.is_module = true
  )
);


--------------------------------------------------------------------------------
-- CAMPAIGN MODULES VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_campaign_module_is_module()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = NEW.module_id AND is_module = true
  ) THEN
    RAISE EXCEPTION 'Referenced campaign % is not a module', NEW.module_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_campaign_module_is_module() OWNER TO postgres;

CREATE TRIGGER enforce_campaign_module_is_module
  BEFORE INSERT OR UPDATE ON public.campaign_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_campaign_module_is_module();

GRANT ALL ON FUNCTION public.validate_campaign_module_is_module() TO anon;
GRANT ALL ON FUNCTION public.validate_campaign_module_is_module() TO authenticated;
GRANT ALL ON FUNCTION public.validate_campaign_module_is_module() TO service_role;


--------------------------------------------------------------------------------
-- USER MODULES VALIDATION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_user_module_is_module()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = NEW.module_id AND is_module = true
  ) THEN
    RAISE EXCEPTION 'Referenced campaign % is not a module', NEW.module_id;
  END IF;
  RETURN NEW;
END;
$$;

ALTER FUNCTION public.validate_user_module_is_module() OWNER TO postgres;

CREATE TRIGGER enforce_user_module_is_module
  BEFORE INSERT OR UPDATE ON public.user_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_module_is_module();

GRANT ALL ON FUNCTION public.validate_user_module_is_module() TO anon;
GRANT ALL ON FUNCTION public.validate_user_module_is_module() TO authenticated;
GRANT ALL ON FUNCTION public.validate_user_module_is_module() TO service_role;


--------------------------------------------------------------------------------
-- CAMPAIGN RESOURCE IDS
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.campaign_resource_ids(
  p_campaign_id uuid,
  p_include_modules boolean DEFAULT false)
RETURNS TABLE(id uuid)
LANGUAGE sql STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT p_campaign_id AS id
  UNION
  SELECT cm.module_id
  FROM public.campaign_modules cm
  WHERE p_include_modules
    AND cm.campaign_id = p_campaign_id;
$$;

ALTER FUNCTION public.campaign_resource_ids(p_campaign_id uuid, p_include_modules boolean) OWNER TO postgres;

GRANT ALL ON FUNCTION public.campaign_resource_ids(p_campaign_id uuid, p_include_modules boolean) TO anon;
GRANT ALL ON FUNCTION public.campaign_resource_ids(p_campaign_id uuid, p_include_modules boolean) TO authenticated;
GRANT ALL ON FUNCTION public.campaign_resource_ids(p_campaign_id uuid, p_include_modules boolean) TO service_role;


--------------------------------------------------------------------------------
-- CAN READ CAMPAIGN RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_read_campaign_resource(p_campaign_id uuid, p_resource_visibility public.campaign_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid))
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() AS uid))
    WHERE c.id = p_campaign_id
      AND (
        (c.is_module = true AND c.visibility = 'public'::public.campaign_visibility)
        OR
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        (c.is_module = false AND cp.user_id IS NOT NULL AND (
          p_resource_visibility = 'player'::public.campaign_role
          OR cp.role = 'game_master'::public.campaign_role
        ))
      )
  );
$$;

ALTER FUNCTION public.can_read_campaign_resource(p_campaign_id uuid, p_resource_visibility public.campaign_role) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_read_campaign_resource(p_campaign_id uuid, p_resource_visibility public.campaign_role) TO anon;
GRANT ALL ON FUNCTION public.can_read_campaign_resource(p_campaign_id uuid, p_resource_visibility public.campaign_role) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_campaign_resource(p_campaign_id uuid, p_resource_visibility public.campaign_role) TO service_role;


--------------------------------------------------------------------------------
-- CAN EDIT CAMPAIGN RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_edit_campaign_resource(p_campaign_id uuid)
RETURNS boolean
LANGUAGE sql
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns c
    LEFT JOIN public.user_modules um ON (um.module_id = c.id AND um.user_id = (SELECT auth.uid() AS uid) AND um.role = 'creator'::public.module_role)
    LEFT JOIN public.campaign_players cp ON (cp.campaign_id = c.id AND cp.user_id = (SELECT auth.uid() as uid) AND cp.role = 'game_master'::public.campaign_role)
    WHERE c.id = p_campaign_id
      AND (
        -- Module creators
        (c.is_module = true AND um.user_id IS NOT NULL)
        OR
        -- Campaign GMs
        (c.is_module = false AND cp.user_id IS NOT NULL)
      )
  );
$$;

ALTER FUNCTION public.can_edit_campaign_resource(p_campaign_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.can_edit_campaign_resource(p_campaign_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_edit_campaign_resource(p_campaign_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_edit_campaign_resource(p_campaign_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH CAMPAIGN ROLE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_campaign_role(p_campaign_id uuid)
RETURNS public.campaign_role
LANGUAGE sql STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT cp.role
  FROM public.campaign_players cp
  WHERE cp.campaign_id = p_campaign_id
    AND cp.user_id = auth.uid()
  LIMIT 1;
$$;

ALTER FUNCTION public.fetch_campaign_role(p_campaign_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_campaign_role(p_campaign_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_campaign_role(p_campaign_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_campaign_role(p_campaign_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- FETCH MODULE ROLE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fetch_module_role(p_module_id uuid)
RETURNS public.module_role
LANGUAGE sql STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT um.role
  FROM public.user_modules um
  WHERE um.module_id = p_module_id
    AND um.user_id = auth.uid()
  LIMIT 1;
$$;

ALTER FUNCTION public.fetch_module_role(p_module_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.fetch_module_role(p_module_id uuid) TO anon;
GRANT ALL ON FUNCTION public.fetch_module_role(p_module_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.fetch_module_role(p_module_id uuid) TO service_role;
