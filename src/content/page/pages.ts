import z from "zod/v4";
import { createLocalStore } from "../../store/local-store";

//------------------------------------------------------------------------------
// Page Ids
//------------------------------------------------------------------------------

export const resourcePageIds = ["spells", "weapons"] as const;

export const pageIds = resourcePageIds;

export type PageId = (typeof resourcePageIds)[number];

//------------------------------------------------------------------------------
// Use Selected Page Id
//------------------------------------------------------------------------------

export const useSelectedPageId = createLocalStore<PageId | "">(
  "navigation.selected-page-id",
  "",
  z.union([z.literal(""), z.enum(pageIds)]).parse
).use;
