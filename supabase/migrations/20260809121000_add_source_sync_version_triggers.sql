--------------------------------------------------------------------------------
-- BUMP SOURCE SYNC VERSION ONCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bump_source_sync_version_once(p_source_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_inserted integer;
BEGIN
  IF p_source_id IS NULL THEN
    RETURN;
  END IF;

  CREATE TEMP TABLE IF NOT EXISTS bumped_source_sync_versions (
    source_id uuid PRIMARY KEY
  ) ON COMMIT DROP;

  INSERT INTO pg_temp.bumped_source_sync_versions (source_id)
  VALUES (p_source_id)
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted > 0 THEN
    UPDATE public.sources
    SET sync_version = sync_version + 1
    WHERE id = p_source_id;
  END IF;
END;
$$;

ALTER FUNCTION public.bump_source_sync_version_once(p_source_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.bump_source_sync_version_once(p_source_id uuid) TO anon;
GRANT ALL ON FUNCTION public.bump_source_sync_version_once(p_source_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.bump_source_sync_version_once(p_source_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- BUMP SOURCE SYNC VERSION FOR RESOURCE
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bump_source_sync_version_for_resource(p_resource_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_source_id uuid;
BEGIN
  IF p_resource_id IS NULL THEN
    RETURN;
  END IF;

  SELECT r.source_id
  INTO v_source_id
  FROM public.resources r
  WHERE r.id = p_resource_id;

  PERFORM public.bump_source_sync_version_once(v_source_id);
END;
$$;

ALTER FUNCTION public.bump_source_sync_version_for_resource(p_resource_id uuid) OWNER TO postgres;

GRANT ALL ON FUNCTION public.bump_source_sync_version_for_resource(p_resource_id uuid) TO anon;
GRANT ALL ON FUNCTION public.bump_source_sync_version_for_resource(p_resource_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.bump_source_sync_version_for_resource(p_resource_id uuid) TO service_role;


--------------------------------------------------------------------------------
-- BUMP SOURCE SYNC VERSION TRIGGER
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.bump_source_sync_version_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_id_kind text := TG_ARGV[0];
  v_column_index integer;
  v_column_name text;
  v_new_id uuid;
  v_old_id uuid;
BEGIN
  IF v_id_kind NOT IN ('source', 'resource') THEN
    RAISE EXCEPTION 'Unsupported sync version id kind: %', v_id_kind;
  END IF;

  FOR v_column_index IN 1..(TG_NARGS - 1) LOOP
    v_column_name := TG_ARGV[v_column_index];
    v_new_id := null;
    v_old_id := null;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
      v_new_id := (to_jsonb(NEW)->>v_column_name)::uuid;

      IF v_id_kind = 'source' THEN
        PERFORM public.bump_source_sync_version_once(v_new_id);
      ELSE
        PERFORM public.bump_source_sync_version_for_resource(v_new_id);
      END IF;
    END IF;

    IF TG_OP IN ('UPDATE', 'DELETE') THEN
      v_old_id := (to_jsonb(OLD)->>v_column_name)::uuid;

      IF TG_OP <> 'UPDATE' OR v_old_id IS DISTINCT FROM v_new_id THEN
        IF v_id_kind = 'source' THEN
          PERFORM public.bump_source_sync_version_once(v_old_id);
        ELSE
          PERFORM public.bump_source_sync_version_for_resource(v_old_id);
        END IF;
      END IF;
    END IF;
  END LOOP;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.bump_source_sync_version_trigger() OWNER TO postgres;

GRANT ALL ON FUNCTION public.bump_source_sync_version_trigger() TO anon;
GRANT ALL ON FUNCTION public.bump_source_sync_version_trigger() TO authenticated;
GRANT ALL ON FUNCTION public.bump_source_sync_version_trigger() TO service_role;


--------------------------------------------------------------------------------
-- SOURCE SYNC VERSION TRIGGERS
--------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS bump_source_sync_version ON public.sources;
CREATE TRIGGER bump_source_sync_version
  AFTER UPDATE OF code, creator_id, type, version, visibility ON public.sources
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('source', 'id');

DROP TRIGGER IF EXISTS bump_resources_sync_version ON public.resources;
CREATE TRIGGER bump_resources_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('source', 'source_id');

DROP TRIGGER IF EXISTS bump_source_translations_sync_version ON public.source_translations;
CREATE TRIGGER bump_source_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.source_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('source', 'source_id');

DROP TRIGGER IF EXISTS bump_source_includes_sync_version ON public.source_includes;
CREATE TRIGGER bump_source_includes_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.source_includes
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('source', 'source_id');

DROP TRIGGER IF EXISTS bump_source_requires_sync_version ON public.source_requires;
CREATE TRIGGER bump_source_requires_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.source_requires
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('source', 'source_id');

DROP TRIGGER IF EXISTS bump_source_ownerships_sync_version ON public.source_ownerships;
DROP TRIGGER IF EXISTS bump_source_roles_sync_version ON public.source_roles;


--------------------------------------------------------------------------------
-- RESOURCE ID SYNC VERSION TRIGGERS
--------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS bump_resource_translations_sync_version ON public.resource_translations;
CREATE TRIGGER bump_resource_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.resource_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_backgrounds_sync_version ON public.backgrounds;
CREATE TRIGGER bump_backgrounds_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.backgrounds
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_background_translations_sync_version ON public.background_translations;
CREATE TRIGGER bump_background_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.background_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_character_classes_sync_version ON public.character_classes;
CREATE TRIGGER bump_character_classes_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.character_classes
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_character_class_translations_sync_version ON public.character_class_translations;
CREATE TRIGGER bump_character_class_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.character_class_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_character_subclasses_sync_version ON public.character_subclasses;
CREATE TRIGGER bump_character_subclasses_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.character_subclasses
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_character_subclass_translations_sync_version ON public.character_subclass_translations;
CREATE TRIGGER bump_character_subclass_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.character_subclass_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_creatures_sync_version ON public.creatures;
CREATE TRIGGER bump_creatures_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.creatures
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_creature_translations_sync_version ON public.creature_translations;
CREATE TRIGGER bump_creature_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.creature_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_creature_tags_sync_version ON public.creature_tags;
CREATE TRIGGER bump_creature_tags_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.creature_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_creature_tag_translations_sync_version ON public.creature_tag_translations;
CREATE TRIGGER bump_creature_tag_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.creature_tag_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_eldritch_invocations_sync_version ON public.eldritch_invocations;
CREATE TRIGGER bump_eldritch_invocations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.eldritch_invocations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_eldritch_invocation_translations_sync_version ON public.eldritch_invocation_translations;
CREATE TRIGGER bump_eldritch_invocation_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.eldritch_invocation_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_equipments_sync_version ON public.equipments;
CREATE TRIGGER bump_equipments_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.equipments
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_equipment_translations_sync_version ON public.equipment_translations;
CREATE TRIGGER bump_equipment_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.equipment_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_feats_sync_version ON public.feats;
CREATE TRIGGER bump_feats_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.feats
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_feat_translations_sync_version ON public.feat_translations;
CREATE TRIGGER bump_feat_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.feat_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_features_sync_version ON public.features;
CREATE TRIGGER bump_features_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.features
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_feature_translations_sync_version ON public.feature_translations;
CREATE TRIGGER bump_feature_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.feature_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_languages_sync_version ON public.languages;
CREATE TRIGGER bump_languages_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.languages
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_language_translations_sync_version ON public.language_translations;
CREATE TRIGGER bump_language_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.language_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_maneuvers_sync_version ON public.maneuvers;
CREATE TRIGGER bump_maneuvers_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.maneuvers
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_maneuver_translations_sync_version ON public.maneuver_translations;
CREATE TRIGGER bump_maneuver_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.maneuver_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_metamagics_sync_version ON public.metamagics;
CREATE TRIGGER bump_metamagics_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.metamagics
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_metamagic_translations_sync_version ON public.metamagic_translations;
CREATE TRIGGER bump_metamagic_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.metamagic_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_modifiers_sync_version ON public.modifiers;
CREATE TRIGGER bump_modifiers_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.modifiers
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_modifier_translations_sync_version ON public.modifier_translations;
CREATE TRIGGER bump_modifier_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.modifier_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_planes_sync_version ON public.planes;
CREATE TRIGGER bump_planes_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.planes
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_plane_translations_sync_version ON public.plane_translations;
CREATE TRIGGER bump_plane_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.plane_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_services_sync_version ON public.services;
CREATE TRIGGER bump_services_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_service_translations_sync_version ON public.service_translations;
CREATE TRIGGER bump_service_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.service_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_species_sync_version ON public.species;
CREATE TRIGGER bump_species_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.species
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_species_translations_sync_version ON public.species_translations;
CREATE TRIGGER bump_species_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.species_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_spells_sync_version ON public.spells;
CREATE TRIGGER bump_spells_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.spells
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_spell_translations_sync_version ON public.spell_translations;
CREATE TRIGGER bump_spell_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.spell_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_vehicles_sync_version ON public.vehicles;
CREATE TRIGGER bump_vehicles_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_vehicle_translations_sync_version ON public.vehicle_translations;
CREATE TRIGGER bump_vehicle_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.vehicle_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_armors_sync_version ON public.armors;
CREATE TRIGGER bump_armors_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.armors
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_armor_translations_sync_version ON public.armor_translations;
CREATE TRIGGER bump_armor_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.armor_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_equipment_modifiers_sync_version ON public.equipment_modifiers;
CREATE TRIGGER bump_equipment_modifiers_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.equipment_modifiers
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_equipment_modifier_translations_sync_version ON public.equipment_modifier_translations;
CREATE TRIGGER bump_equipment_modifier_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.equipment_modifier_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_items_sync_version ON public.items;
CREATE TRIGGER bump_items_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_item_translations_sync_version ON public.item_translations;
CREATE TRIGGER bump_item_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.item_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_tools_sync_version ON public.tools;
CREATE TRIGGER bump_tools_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_tool_translations_sync_version ON public.tool_translations;
CREATE TRIGGER bump_tool_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.tool_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_weapons_sync_version ON public.weapons;
CREATE TRIGGER bump_weapons_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.weapons
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_weapon_translations_sync_version ON public.weapon_translations;
CREATE TRIGGER bump_weapon_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.weapon_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_armor_modifiers_sync_version ON public.armor_modifiers;
CREATE TRIGGER bump_armor_modifiers_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.armor_modifiers
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_armor_modifier_translations_sync_version ON public.armor_modifier_translations;
CREATE TRIGGER bump_armor_modifier_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.armor_modifier_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_item_modifiers_sync_version ON public.item_modifiers;
CREATE TRIGGER bump_item_modifiers_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.item_modifiers
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_item_modifier_translations_sync_version ON public.item_modifier_translations;
CREATE TRIGGER bump_item_modifier_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.item_modifier_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_tool_modifiers_sync_version ON public.tool_modifiers;
CREATE TRIGGER bump_tool_modifiers_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.tool_modifiers
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_tool_modifier_translations_sync_version ON public.tool_modifier_translations;
CREATE TRIGGER bump_tool_modifier_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.tool_modifier_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_weapon_modifiers_sync_version ON public.weapon_modifiers;
CREATE TRIGGER bump_weapon_modifiers_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.weapon_modifiers
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_weapon_modifier_translations_sync_version ON public.weapon_modifier_translations;
CREATE TRIGGER bump_weapon_modifier_translations_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.weapon_modifier_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');


--------------------------------------------------------------------------------
-- RESOURCE RELATION SYNC VERSION TRIGGERS
--------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS bump_background_starting_equipment_sync_version ON public.background_starting_equipment;
CREATE TRIGGER bump_background_starting_equipment_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.background_starting_equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'background_id');

DROP TRIGGER IF EXISTS bump_character_class_spells_sync_version ON public.character_class_spells;
CREATE TRIGGER bump_character_class_spells_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.character_class_spells
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'character_class_id');

DROP TRIGGER IF EXISTS bump_character_class_starting_equipment_sync_version ON public.character_class_starting_equipment;
CREATE TRIGGER bump_character_class_starting_equipment_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.character_class_starting_equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'character_class_id');

DROP TRIGGER IF EXISTS bump_character_class_tool_proficiencies_sync_version ON public.character_class_tool_proficiencies;
CREATE TRIGGER bump_character_class_tool_proficiencies_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.character_class_tool_proficiencies
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'character_class_id');

DROP TRIGGER IF EXISTS bump_creature_creature_tags_sync_version ON public.creature_creature_tags;
CREATE TRIGGER bump_creature_creature_tags_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.creature_creature_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'creature_id');

DROP TRIGGER IF EXISTS bump_creature_equipment_sync_version ON public.creature_equipment;
CREATE TRIGGER bump_creature_equipment_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.creature_equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'creature_id');

DROP TRIGGER IF EXISTS bump_creature_languages_sync_version ON public.creature_languages;
CREATE TRIGGER bump_creature_languages_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.creature_languages
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'creature_id');

DROP TRIGGER IF EXISTS bump_creature_planes_sync_version ON public.creature_planes;
CREATE TRIGGER bump_creature_planes_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.creature_planes
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'creature_id');

DROP TRIGGER IF EXISTS bump_resource_features_sync_version ON public.resource_features;
CREATE TRIGGER bump_resource_features_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.resource_features
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'resource_id');

DROP TRIGGER IF EXISTS bump_tool_crafts_sync_version ON public.tool_crafts;
CREATE TRIGGER bump_tool_crafts_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.tool_crafts
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'tool_id');

DROP TRIGGER IF EXISTS bump_weapon_ammunitions_sync_version ON public.weapon_ammunitions;
CREATE TRIGGER bump_weapon_ammunitions_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.weapon_ammunitions
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'weapon_id');

DROP TRIGGER IF EXISTS bump_armor_modifier_applications_sync_version ON public.armor_modifier_applications;
CREATE TRIGGER bump_armor_modifier_applications_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.armor_modifier_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'armor_id', 'armor_modifier_id');

DROP TRIGGER IF EXISTS bump_item_modifier_applications_sync_version ON public.item_modifier_applications;
CREATE TRIGGER bump_item_modifier_applications_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.item_modifier_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'item_id', 'item_modifier_id');

DROP TRIGGER IF EXISTS bump_tool_modifier_applications_sync_version ON public.tool_modifier_applications;
CREATE TRIGGER bump_tool_modifier_applications_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.tool_modifier_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'tool_id', 'tool_modifier_id');

DROP TRIGGER IF EXISTS bump_weapon_modifier_applications_sync_version ON public.weapon_modifier_applications;
CREATE TRIGGER bump_weapon_modifier_applications_sync_version
  AFTER INSERT OR UPDATE OR DELETE ON public.weapon_modifier_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_source_sync_version_trigger('resource', 'weapon_id', 'weapon_modifier_id');
