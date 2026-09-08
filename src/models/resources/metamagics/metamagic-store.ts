import { createResourceStore } from "../resource-store";
import { useLocalizeMetamagic } from "./localized-metamagic";
import {
  defaultMetamagic,
  metamagicSchema,
  metamagicTranslationFields,
} from "./metamagic";
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
  resourceSchema: metamagicSchema,
  translationFields: metamagicTranslationFields,
  useLocalizeResource: useLocalizeMetamagic,
});
