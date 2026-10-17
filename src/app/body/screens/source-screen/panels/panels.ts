import {
  AwardIcon,
  BookOpenTextIcon,
  CornerDownRightIcon,
  DnaIcon,
  EarthIcon,
  HandCoinsIcon,
  HammerIcon,
  ImageIcon,
  KeyRoundIcon,
  LanguagesIcon,
  PackageIcon,
  PawPrintIcon,
  SailboatIcon,
  ScrollTextIcon,
  SplitIcon,
  SwordIcon,
  TagIcon,
  TreesIcon,
  UserGroupIcon,
  UserIcon,
  UserStarIcon,
  WandSparklesIcon,
  type LucideIcon,
  ShieldPlusIcon,
  ChessQueenIcon,
} from "lucide-react";
import { Route } from "~/navigation/routes";

//------------------------------------------------------------------------------
// Panel Item
//------------------------------------------------------------------------------

export type PanelItem = {
  Icon: LucideIcon;
  modifier?: boolean;
  route: Route;
};

const panelItem = <R extends Route>(
  route: R,
  Icon: LucideIcon,
  extra: Omit<PanelItem, "Icon" | "route"> = {},
) => ({
  Icon,
  route,
  ...extra,
});

//------------------------------------------------------------------------------
// Bestiary Panel Ids
//------------------------------------------------------------------------------

export const bestiaryPanelIds = [
  panelItem(Route.ResourcesBestiaryMonsters, PawPrintIcon),
  panelItem(Route.ResourcesBestiaryFamilies, UserGroupIcon),
  panelItem(Route.ResourcesBestiaryTags, TagIcon),
  panelItem(Route.ResourcesBestiaryHabitats, TreesIcon),
  panelItem(Route.ResourcesBestiaryTreasures, ChessQueenIcon),
] as const;

//------------------------------------------------------------------------------
// Bestiary Panel Id
//------------------------------------------------------------------------------

export type BestiaryPanelId = (typeof bestiaryPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// Character Panel Ids
//------------------------------------------------------------------------------

export const characterPanelIds = [
  panelItem(Route.ResourcesCharacterClasses, UserIcon),
  panelItem(Route.ResourcesCharacterSubclasses, UserStarIcon),
  panelItem(Route.ResourcesCharacterBackgrounds, ImageIcon),
  panelItem(Route.ResourcesCharacterSpecies, DnaIcon),
  panelItem(Route.ResourcesCharacterFeats, AwardIcon),
  panelItem(Route.ResourcesBlocksFeatures, KeyRoundIcon),
] as const;

//------------------------------------------------------------------------------
// Character Panel Id
//------------------------------------------------------------------------------

export type CharacterPanelId = (typeof characterPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// Abilities Panel Ids
//------------------------------------------------------------------------------

export const abilitiesPanelIds = [
  panelItem(Route.ResourcesAbilitiesSpells, ScrollTextIcon),
  panelItem(Route.ResourcesAbilitiesEldritchInvocations, BookOpenTextIcon),
  panelItem(Route.ResourcesAbilitiesManeuvers, SplitIcon),
  panelItem(Route.ResourcesAbilitiesMetamagic, WandSparklesIcon),
] as const;

//------------------------------------------------------------------------------
// Abilities Panel Id
//------------------------------------------------------------------------------

export type AbilitiesPanelId = (typeof abilitiesPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// Equipment Panel Ids
//------------------------------------------------------------------------------

export const equipmentPanelIds = [
  panelItem(Route.ResourcesEquipmentItems, PackageIcon),
  panelItem(Route.ResourcesEquipmentItemModifiers, CornerDownRightIcon, { modifier: true }),
  panelItem(Route.ResourcesEquipmentArmors, ShieldPlusIcon),
  panelItem(Route.ResourcesEquipmentArmorModifiers, CornerDownRightIcon, { modifier: true }),
  panelItem(Route.ResourcesEquipmentWeapons, SwordIcon),
  panelItem(Route.ResourcesEquipmentWeaponModifiers, CornerDownRightIcon, { modifier: true }),
  panelItem(Route.ResourcesEquipmentTools, HammerIcon),
  panelItem(Route.ResourcesEquipmentToolModifiers, CornerDownRightIcon, { modifier: true }),
] as const;

//------------------------------------------------------------------------------
// Equipment Panel Id
//------------------------------------------------------------------------------

export type EquipmentPanelId = (typeof equipmentPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// Market Panel Ids
//------------------------------------------------------------------------------

export const marketPanelIds = [
  panelItem(Route.ResourcesMarketVehicles, SailboatIcon),
  panelItem(Route.ResourcesMarketServices, HandCoinsIcon),
] as const;

//------------------------------------------------------------------------------
// Market Panel Id
//------------------------------------------------------------------------------

export type MarketPanelId = (typeof marketPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// World Panel Ids
//------------------------------------------------------------------------------

export const worldPanelIds = [
  panelItem(Route.ResourcesWorldLanguages, LanguagesIcon),
  panelItem(Route.ResourcesWorldPlanes, EarthIcon),
] as const;

//------------------------------------------------------------------------------
// World Panel Id
//------------------------------------------------------------------------------

export type WorldPanelId = (typeof worldPanelIds)[number]["route"];

//------------------------------------------------------------------------------
// Resource Panels
//------------------------------------------------------------------------------

export const resourcePanels = [
  { id: Route.ResourcesCharacter, items: characterPanelIds },
  { id: Route.ResourcesAbilities, items: abilitiesPanelIds },
  { id: Route.ResourcesBestiary, items: bestiaryPanelIds },
  { id: Route.ResourcesEquipment, items: equipmentPanelIds },
  { id: Route.ResourcesMarket, items: marketPanelIds },
  { id: Route.ResourcesWorld, items: worldPanelIds },
] as const;
