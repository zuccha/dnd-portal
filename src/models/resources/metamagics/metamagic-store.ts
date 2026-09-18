import { createResourceStore } from "../resource-store";
import { localizeMetamagic, useMetamagicLocalizationContext } from "./localized-metamagic";
import { defaultMetamagic, metamagicTranslationFields } from "./metamagic";
import {
  defaultMetamagicFilters,
  metamagicFiltersSchema,
  metamagicOrderOptions,
} from "./metamagic-filters";

//------------------------------------------------------------------------------
// Metamagic Store
//------------------------------------------------------------------------------

export const metamagicStore = createResourceStore("metamagic", {
  defaultFilters: defaultMetamagicFilters,
  defaultResource: defaultMetamagic,
  displayName: { en: "Metamagic", it: "Metamagic" },
  filtersSchema: metamagicFiltersSchema,
  orderOptions: metamagicOrderOptions,
  translationFields: metamagicTranslationFields,
  localizeResource: localizeMetamagic,
  useLocalizationContext: useMetamagicLocalizationContext,
});
