import type { ResourceKind } from "~/models/types/resource-kind";
import BackgroundDetailRoute from "./resources/background/background-detail-route";
import CharacterClassDetailRoute from "./resources/character-class/character-class-detail-route";
import CharacterSubclassDetailRoute from "./resources/character-subclass/character-subclass-detail-route";
import CreatureFamilyDetailRoute from "./resources/creature-family/creature-family-detail-route";
import CreatureTagDetailRoute from "./resources/creature-tag/creature-tag-detail-route";
import CreatureDetailRoute from "./resources/creature/creature-detail-route";
import EldritchInvocationDetailRoute from "./resources/eldritch-invocation/eldritch-invocation-detail-route";
import ArmorDetailRoute from "./resources/equipment/armor/armor-detail-route";
import ItemDetailRoute from "./resources/equipment/item/item-detail-route";
import ToolDetailRoute from "./resources/equipment/tool/tool-detail-route";
import WeaponDetailRoute from "./resources/equipment/weapon/weapon-detail-route";
import FeatDetailRoute from "./resources/feat/feat-detail-route";
import FeatureDetailRoute from "./resources/feature/feature-detail-route";
import LanguageDetailRoute from "./resources/language-detail-route";
import ManeuverDetailRoute from "./resources/maneuver/maneuver-detail-route";
import MetamagicDetailRoute from "./resources/metamagic/metamagic-detail-route";
import ArmorModifierDetailRoute from "./resources/modifiers/equipment/armor/armor-modifier-detail-route";
import ItemModifierDetailRoute from "./resources/modifiers/equipment/item/item-modifier-detail-route";
import ToolModifierDetailRoute from "./resources/modifiers/equipment/tool/tool-modifier-detail-route";
import WeaponModifierDetailRoute from "./resources/modifiers/equipment/weapon/weapon-modifier-detail-route";
import PlaneDetailRoute from "./resources/plane-detail-route";
import ServiceDetailRoute from "./resources/service/service-detail-route";
import SpeciesDetailRoute from "./resources/species/species-detail-route";
import SpellDetailRoute from "./resources/spell/spell-detail-route";
import VehicleDetailRoute from "./resources/vehicle/vehicle-detail-route";
import type { ComponentType } from "react";

type ResourceDetailRouteProps = { resourceId: string };

export const resourceDetailByKind: Record<ResourceKind, ComponentType<ResourceDetailRouteProps>> = {
  armor: ArmorDetailRoute,
  armor_modifier: ArmorModifierDetailRoute,
  background: BackgroundDetailRoute,
  character_class: CharacterClassDetailRoute,
  character_subclass: CharacterSubclassDetailRoute,
  creature: CreatureDetailRoute,
  creature_family: CreatureFamilyDetailRoute,
  creature_tag: CreatureTagDetailRoute,
  eldritch_invocation: EldritchInvocationDetailRoute,
  feat: FeatDetailRoute,
  feature: FeatureDetailRoute,
  item: ItemDetailRoute,
  item_modifier: ItemModifierDetailRoute,
  language: LanguageDetailRoute,
  maneuver: ManeuverDetailRoute,
  metamagic: MetamagicDetailRoute,
  plane: PlaneDetailRoute,
  service: ServiceDetailRoute,
  species: SpeciesDetailRoute,
  spell: SpellDetailRoute,
  tool: ToolDetailRoute,
  tool_modifier: ToolModifierDetailRoute,
  vehicle: VehicleDetailRoute,
  weapon: WeaponDetailRoute,
  weapon_modifier: WeaponModifierDetailRoute,
};
