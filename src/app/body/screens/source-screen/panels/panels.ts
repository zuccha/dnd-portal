import { Route } from "~/navigation/routes";

//------------------------------------------------------------------------------
// Bestiary Panel Ids
//------------------------------------------------------------------------------

export const bestiaryPanelIds = [
  Route.ResourcesBestiaryMonsters,
  Route.ResourcesBestiaryTags,
] as const;

export type BestiaryPanelId = (typeof bestiaryPanelIds)[number];

//------------------------------------------------------------------------------
// Character Panel Ids
//------------------------------------------------------------------------------

export const characterPanelIds = [
  Route.ResourcesCharacterClasses,
  Route.ResourcesCharacterSubclasses,
  Route.ResourcesCharacterBackgrounds,
  Route.ResourcesCharacterSpecies,
  Route.ResourcesCharacterFeats,
] as const;

export type CharacterPanelId = (typeof characterPanelIds)[number];

//------------------------------------------------------------------------------
// Abilities Panel Ids
//------------------------------------------------------------------------------

export const abilitiesPanelIds = [
  Route.ResourcesAbilitiesSpells,
  Route.ResourcesAbilitiesEldritchInvocations,
  Route.ResourcesAbilitiesManeuvers,
  Route.ResourcesAbilitiesMetamagic,
] as const;

export type AbilitiesPanelId = (typeof abilitiesPanelIds)[number];

//------------------------------------------------------------------------------
// Blocks Panel Ids
//------------------------------------------------------------------------------

export const blocksPanelIds = [Route.ResourcesBlocksFeatures] as const;

export type BlocksPanelId = (typeof blocksPanelIds)[number];

//------------------------------------------------------------------------------
// Equipment Panel Ids
//------------------------------------------------------------------------------

export const equipmentPanelIds = [
  Route.ResourcesEquipmentItems,
  Route.ResourcesEquipmentItemModifiers,
  Route.ResourcesEquipmentArmors,
  Route.ResourcesEquipmentArmorModifiers,
  Route.ResourcesEquipmentWeapons,
  Route.ResourcesEquipmentWeaponModifiers,
  Route.ResourcesEquipmentTools,
  Route.ResourcesEquipmentToolModifiers,
] as const;

export type EquipmentPanelId = (typeof equipmentPanelIds)[number];

//------------------------------------------------------------------------------
// Market Panel Ids
//------------------------------------------------------------------------------

export const marketPanelIds = [
  Route.ResourcesMarketVehicles,
  Route.ResourcesMarketServices,
] as const;

export type MarketPanelId = (typeof marketPanelIds)[number];

//------------------------------------------------------------------------------
// World Panel Ids
//------------------------------------------------------------------------------

export const worldPanelIds = [
  Route.ResourcesWorldLanguages,
  Route.ResourcesWorldPlanes,
] as const;

export type WorldPanelId = (typeof worldPanelIds)[number];

//------------------------------------------------------------------------------
// Resource Panels
//------------------------------------------------------------------------------

export const resourcePanels = [
  { id: Route.ResourcesCharacter, items: characterPanelIds },
  { id: Route.ResourcesBlocks, items: blocksPanelIds },
  { id: Route.ResourcesAbilities, items: abilitiesPanelIds },
  { id: Route.ResourcesBestiary, items: bestiaryPanelIds },
  { id: Route.ResourcesEquipment, items: equipmentPanelIds },
  { id: Route.ResourcesMarket, items: marketPanelIds },
  { id: Route.ResourcesWorld, items: worldPanelIds },
] as const;

//------------------------------------------------------------------------------
// Setting Panel Ids
//------------------------------------------------------------------------------

export const settingPanelIds = [Route.SettingsCampaign] as const;

export type SettingPanelId = (typeof settingPanelIds)[number];
