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
  Route.ResourcesCharacterEldritchInvocations,
  Route.ResourcesCharacterSpells,
] as const;

export type CharacterPanelId = (typeof characterPanelIds)[number];

//------------------------------------------------------------------------------
// Equipment Panel Ids
//------------------------------------------------------------------------------

export const equipmentPanelIds = [
  Route.ResourcesEquipmentArmors,
  Route.ResourcesEquipmentItems,
  Route.ResourcesEquipmentTools,
  Route.ResourcesEquipmentWeapons,
] as const;

export type EquipmentPanelId = (typeof equipmentPanelIds)[number];

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
  { id: Route.ResourcesBestiary, items: bestiaryPanelIds },
  { id: Route.ResourcesEquipment, items: equipmentPanelIds },
  { id: Route.ResourcesWorld, items: worldPanelIds },
] as const;

//------------------------------------------------------------------------------
// Setting Panel Ids
//------------------------------------------------------------------------------

export const settingPanelIds = [Route.SettingsCampaign] as const;

export type SettingPanelId = (typeof settingPanelIds)[number];
