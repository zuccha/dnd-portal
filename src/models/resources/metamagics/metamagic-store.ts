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

export const metamagicStore = createResourceStore(
  { p: "metamagics", s: "metamagic" },
  {
    defaultFilters: defaultMetamagicFilters,
    defaultResource: defaultMetamagic,
    filtersSchema: metamagicFiltersSchema,
    kinds: ["metamagic"],
    orderOptions: metamagicOrderOptions,
    resourceSchema: metamagicSchema,
    translationFields: metamagicTranslationFields,
    useLocalizeResource: useLocalizeMetamagic,
  },
);
