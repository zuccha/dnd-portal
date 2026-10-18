import type { ResourceKind } from "~/models/types/resource-kind";

//------------------------------------------------------------------------------
// Route
//------------------------------------------------------------------------------

export const Route = {
  _: "/",
  About: "/about",
  Guide: "/guide",
  PrintDeck: "/print-deck",
  Resources: "/resources",
  ResourcesAbilities: "/resources/abilities",
  ResourcesAbilitiesEldritchInvocations: "/resources/eldritch-invocations",
  ResourcesAbilitiesManeuvers: "/resources/maneuvers",
  ResourcesAbilitiesMetamagic: "/resources/metamagic",
  ResourcesAbilitiesSpells: "/resources/spells",
  ResourcesBestiary: "/resources/bestiary",
  ResourcesBestiaryMonsters: "/resources/creatures",
  ResourcesBestiaryFamilies: "/resources/creature-families",
  ResourcesBestiaryHabitats: "/resources/creature-habitats",
  ResourcesBestiaryTags: "/resources/creature-tags",
  ResourcesBestiaryTreasures: "/resources/creature-treasures",
  ResourcesBlocksFeatures: "/resources/features",
  ResourcesCharacter: "/resources/character",
  ResourcesCharacterBackgrounds: "/resources/backgrounds",
  ResourcesCharacterClasses: "/resources/classes",
  ResourcesCharacterFeats: "/resources/feats",
  ResourcesCharacterSpecies: "/resources/species",
  ResourcesCharacterSubclasses: "/resources/subclasses",
  ResourcesEquipment: "/resources/equipment",
  ResourcesEquipmentArmorModifiers: "/resources/armor-modifiers",
  ResourcesEquipmentArmors: "/resources/armors",
  ResourcesEquipmentItemModifiers: "/resources/item-modifiers",
  ResourcesEquipmentItems: "/resources/items",
  ResourcesEquipmentToolModifiers: "/resources/tool-modifiers",
  ResourcesEquipmentTools: "/resources/tools",
  ResourcesEquipmentWeaponModifiers: "/resources/weapon-modifiers",
  ResourcesEquipmentWeapons: "/resources/weapons",
  ResourcesMarket: "/resources/market",
  ResourcesMarketServices: "/resources/services",
  ResourcesMarketVehicles: "/resources/vehicles",
  ResourcesWorld: "/resources/world",
  ResourcesWorldLanguages: "/resources/languages",
  ResourcesWorldPlanes: "/resources/planes",
  Settings: "/settings",
  SignIn: "/sign-in",
  SignUp: "/sign-up",
  Sources: "/sources",
} as const;

export type Route = (typeof Route)[keyof typeof Route];

export const routes = Object.values(Route);

//------------------------------------------------------------------------------
// Route By Kind
//------------------------------------------------------------------------------

export const RouteByKind = {
  armor: Route.ResourcesEquipmentArmors,
  armor_modifier: Route.ResourcesEquipmentArmorModifiers,
  background: Route.ResourcesCharacterBackgrounds,
  character_class: Route.ResourcesCharacterClasses,
  character_subclass: Route.ResourcesCharacterSubclasses,
  creature: Route.ResourcesBestiaryMonsters,
  creature_family: Route.ResourcesBestiaryFamilies,
  creature_habitat: Route.ResourcesBestiaryHabitats,
  creature_tag: Route.ResourcesBestiaryTags,
  creature_treasure: Route.ResourcesBestiaryTreasures,
  eldritch_invocation: Route.ResourcesAbilitiesEldritchInvocations,
  feat: Route.ResourcesCharacterFeats,
  feature: Route.ResourcesBlocksFeatures,
  item: Route.ResourcesEquipmentItems,
  item_modifier: Route.ResourcesEquipmentItemModifiers,
  language: Route.ResourcesWorldLanguages,
  maneuver: Route.ResourcesAbilitiesManeuvers,
  metamagic: Route.ResourcesAbilitiesMetamagic,
  plane: Route.ResourcesWorldPlanes,
  service: Route.ResourcesMarketServices,
  species: Route.ResourcesCharacterSpecies,
  spell: Route.ResourcesAbilitiesSpells,
  tool: Route.ResourcesEquipmentTools,
  tool_modifier: Route.ResourcesEquipmentToolModifiers,
  vehicle: Route.ResourcesMarketVehicles,
  weapon: Route.ResourcesEquipmentWeapons,
  weapon_modifier: Route.ResourcesEquipmentWeaponModifiers,
} satisfies Record<ResourceKind, Route>;

//------------------------------------------------------------------------------
// Source Settings Route
//------------------------------------------------------------------------------

export function sourceSettingsRoute(sourceId: string): string {
  return `${Route.Sources}/${sourceId}`;
}

//------------------------------------------------------------------------------
// Resource Detail Route
//------------------------------------------------------------------------------

export function resourceDetailRoute(kind: ResourceKind, resourceId: string): string {
  return `${RouteByKind[kind]}/${encodeURIComponent(resourceId)}`;
}
