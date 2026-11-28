import { matchesInclusion } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { localizePc, usePcLocalizationContext } from "./localized-pc";
import { defaultPc, pcTranslationFields } from "./pc";
import { defaultPcFilters, pcFiltersSchema, pcOrderOptions } from "./pc-filters";

//------------------------------------------------------------------------------
// PC Store
//------------------------------------------------------------------------------

export const pcStore = createResourceStore("pc", {
  defaultFilters: defaultPcFilters,
  defaultResource: defaultPc,
  displayName: { en: "Player Characters", it: "Personaggi Giocanti" },
  filtersSchema: pcFiltersSchema,
  localizeResource: localizePc,
  matchesResource: (pc, filters) => matchesInclusion(pc.status, filters.statuses),
  orderOptions: pcOrderOptions,
  translationFields: pcTranslationFields,
  useLocalizationContext: usePcLocalizationContext,
});
