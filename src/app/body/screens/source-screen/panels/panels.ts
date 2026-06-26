import { Route } from "~/navigation/routes";

//------------------------------------------------------------------------------
// Panel Item
//------------------------------------------------------------------------------

export type PanelItem = {
  modifier?: boolean;
  route: Route;
};

const panelItem = <R extends Route>(
  route: R,
  extra: Omit<PanelItem, "route"> = {},
) => ({ route, ...extra });

//------------------------------------------------------------------------------
// Bestiary Panel Ids
//------------------------------------------------------------------------------

export const bestiaryPanelIds = [
  panelItem(Route.ResourcesBestiaryMonsters),
  panelItem(Route.ResourcesBestiaryTags),
] as const;

export type BestiaryPanelId = (typeof bestiaryPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// Character Panel Ids
//------------------------------------------------------------------------------

export const characterPanelIds = [
  panelItem(Route.ResourcesCharacterClasses),
  panelItem(Route.ResourcesCharacterSubclasses),
  panelItem(Route.ResourcesCharacterBackgrounds),
  panelItem(Route.ResourcesCharacterSpecies),
  panelItem(Route.ResourcesCharacterFeats),
] as const;

export type CharacterPanelId = (typeof characterPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// Abilities Panel Ids
//------------------------------------------------------------------------------

export const abilitiesPanelIds = [
  panelItem(Route.ResourcesAbilitiesSpells),
  panelItem(Route.ResourcesAbilitiesEldritchInvocations),
  panelItem(Route.ResourcesAbilitiesManeuvers),
  panelItem(Route.ResourcesAbilitiesMetamagic),
] as const;

export type AbilitiesPanelId = (typeof abilitiesPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// Blocks Panel Ids
//------------------------------------------------------------------------------

export const blocksPanelIds = [
  panelItem(Route.ResourcesBlocksFeatures),
] as const;

export type BlocksPanelId = (typeof blocksPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// Equipment Panel Ids
//------------------------------------------------------------------------------

export const equipmentPanelIds = [
  panelItem(Route.ResourcesEquipmentItems),
  panelItem(Route.ResourcesEquipmentItemModifiers, { modifier: true }),
  panelItem(Route.ResourcesEquipmentArmors),
  panelItem(Route.ResourcesEquipmentArmorModifiers, { modifier: true }),
  panelItem(Route.ResourcesEquipmentWeapons),
  panelItem(Route.ResourcesEquipmentWeaponModifiers, { modifier: true }),
  panelItem(Route.ResourcesEquipmentTools),
  panelItem(Route.ResourcesEquipmentToolModifiers, { modifier: true }),
] as const;

export type EquipmentPanelId = (typeof equipmentPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// Market Panel Ids
//------------------------------------------------------------------------------

export const marketPanelIds = [
  panelItem(Route.ResourcesMarketVehicles),
  panelItem(Route.ResourcesMarketServices),
] as const;

export type MarketPanelId = (typeof marketPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// World Panel Ids
//------------------------------------------------------------------------------

export const worldPanelIds = [
  panelItem(Route.ResourcesWorldLanguages),
  panelItem(Route.ResourcesWorldPlanes),
] as const;

export type WorldPanelId = (typeof worldPanelIds)[number]["route"];

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
