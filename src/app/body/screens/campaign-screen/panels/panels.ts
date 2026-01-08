import z from "zod";
import { createLocalStore } from "~/store/local-store";

//------------------------------------------------------------------------------
// Bestiary Panel Ids
//------------------------------------------------------------------------------

export const bestiaryPanelIds = ["resource.bestiary.monsters"] as const;

export type BestiaryPanelId = (typeof bestiaryPanelIds)[number];

//------------------------------------------------------------------------------
// Character Panel Ids
//------------------------------------------------------------------------------

export const characterPanelIds = [
  "resource.character.character_classes",
  "resource.character.eldritch_invocations",
  "resource.character.spells",
] as const;

export type CharacterPanelId = (typeof characterPanelIds)[number];

//------------------------------------------------------------------------------
// Equipment Panel Ids
//------------------------------------------------------------------------------

export const equipmentPanelIds = [
  "resource.equipment.armors",
  "resource.equipment.items",
  "resource.equipment.tools",
  "resource.equipment.weapons",
] as const;

export type EquipmentPanelId = (typeof equipmentPanelIds)[number];

//------------------------------------------------------------------------------
// World Panel Ids
//------------------------------------------------------------------------------

export const worldPanelIds = [
  "resource.world.languages",
  "resource.world.planes",
] as const;

export type WorldPanelId = (typeof worldPanelIds)[number];

//------------------------------------------------------------------------------
// Resource Panels
//------------------------------------------------------------------------------

export const resourcePanels = [
  { id: "resource.character", items: characterPanelIds },
  { id: "resource.bestiary", items: bestiaryPanelIds },
  { id: "resource.equipment", items: equipmentPanelIds },
  { id: "resource.world", items: worldPanelIds },
] as const;

//------------------------------------------------------------------------------
// Setting Panel Ids
//------------------------------------------------------------------------------

export const settingPanelIds = ["settings.campaign"] as const;

export type SettingPanelId = (typeof settingPanelIds)[number];

//------------------------------------------------------------------------------
// Use Selected Panel Id
//------------------------------------------------------------------------------

export const useSelectedPanelId = createLocalStore<string>(
  "navigation.selected-panel-id",
  "",
  z.string().parse,
).use;
