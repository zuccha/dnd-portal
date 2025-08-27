import z from "zod/v4";
import { createLocalStore } from "../../../../../store/local-store";

//------------------------------------------------------------------------------
// Panel Ids
//------------------------------------------------------------------------------

export const resourcePanelIds = [
  "resource/spells",
  "resource/weapons",
] as const;

export type ResourcePanelId = (typeof resourcePanelIds)[number];

//------------------------------------------------------------------------------
// Use Selected Panel Id
//------------------------------------------------------------------------------

export const useSelectedPanelId = createLocalStore<string>(
  "navigation.selected-panel-id",
  "",
  z.string().parse
).use;
