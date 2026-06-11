import { createResourceStore } from "../resource-store";
import {
  backgroundSchema,
  backgroundTranslationFields,
  defaultBackground,
} from "./background";
import {
  backgroundFiltersSchema,
  backgroundOrderOptions,
  defaultBackgroundFilters,
} from "./background-filters";
import { useLocalizeBackground } from "./localized-background";

//------------------------------------------------------------------------------
// Background Store
//------------------------------------------------------------------------------

export const backgroundStore = createResourceStore(
  { p: "backgrounds", s: "background" },
  {
    defaultFilters: defaultBackgroundFilters,
    defaultResource: defaultBackground,
    filtersSchema: backgroundFiltersSchema,
    kinds: ["background"],
    orderOptions: backgroundOrderOptions,
    resourceSchema: backgroundSchema,
    translationFields: backgroundTranslationFields,
    useLocalizeResource: useLocalizeBackground,
  },
);

