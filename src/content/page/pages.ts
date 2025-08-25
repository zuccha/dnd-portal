import z from "zod/v4";
import { createLocalStore } from "../../store/local-store";

//------------------------------------------------------------------------------
// Page Ids
//------------------------------------------------------------------------------

export const resourcePageIds = ["resource/spells", "resource/weapons"] as const;

export type ResourcePageId = (typeof resourcePageIds)[number];

//------------------------------------------------------------------------------
// Use Selected Page Id
//------------------------------------------------------------------------------

export const useSelectedPageId = createLocalStore<string>(
  "navigation.selected-page-id",
  "",
  z.string().parse
).use;
