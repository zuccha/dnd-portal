import z from "zod";
import { createLocalStore } from "~/store/local-store";

//------------------------------------------------------------------------------
// Resource Panel Ids
//------------------------------------------------------------------------------

export const resourcePanelIds = [
  "resource/armors",
  "resource/character-classes",
  "resource/creatures",
  "resource/eldritch-invocations",
  "resource/items",
  "resource/languages",
  "resource/planes",
  "resource/spells",
  "resource/tools",
  "resource/weapons",
] as const;

export type ResourcePanelId = (typeof resourcePanelIds)[number];

//------------------------------------------------------------------------------
// Setting Panel Ids
//------------------------------------------------------------------------------

export const settingPanelIds = ["setting/campaign"] as const;

export type SettingPanelId = (typeof settingPanelIds)[number];

//------------------------------------------------------------------------------
// Use Selected Panel Id
//------------------------------------------------------------------------------

export const useSelectedPanelId = createLocalStore<string>(
  "navigation.selected-panel-id",
  "",
  z.string().parse,
).use;
