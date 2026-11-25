import { createResourceStore } from "../resource-store";
import { localizeNpc, useNpcLocalizationContext } from "./localized-npc";
import { defaultNpc, npcTranslationFields } from "./npc";
import { defaultNpcFilters, npcFiltersSchema, npcOrderOptions } from "./npc-filters";

//------------------------------------------------------------------------------
// NPC Store
//------------------------------------------------------------------------------

export const npcStore = createResourceStore("npc", {
  defaultFilters: defaultNpcFilters,
  defaultResource: defaultNpc,
  displayName: { en: "NPCs", it: "PNG" },
  filtersSchema: npcFiltersSchema,
  orderOptions: npcOrderOptions,
  translationFields: npcTranslationFields,
  localizeResource: localizeNpc,
  useLocalizationContext: useNpcLocalizationContext,
});
