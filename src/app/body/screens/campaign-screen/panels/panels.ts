import z from "zod";
import { createLocalStore } from "~/store/local-store";

//------------------------------------------------------------------------------
// Resource Panel Ids
//------------------------------------------------------------------------------

export const resourcePanelIds = [
  "resource/armors",
  "resource/creatures",
  "resource/eldritch-invocations",
  "resource/items",
  "resource/spells",
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
