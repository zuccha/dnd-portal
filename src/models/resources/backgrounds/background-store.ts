import { createResourceStore } from "../resource-store";
import { backgroundTranslationFields, defaultBackground } from "./background";
import {
  backgroundFiltersSchema,
  backgroundOrderOptions,
  defaultBackgroundFilters,
} from "./background-filters";
import { localizeBackground, useBackgroundLocalizationContext } from "./localized-background";

//------------------------------------------------------------------------------
// Background Store
//------------------------------------------------------------------------------

export const backgroundStore = createResourceStore("background", {
  defaultFilters: defaultBackgroundFilters,
  defaultResource: defaultBackground,
  displayName: { en: "Backgrounds", it: "Background" },
  filtersSchema: backgroundFiltersSchema,
  orderOptions: backgroundOrderOptions,
  translationFields: backgroundTranslationFields,
  localizeResource: localizeBackground,
  useLocalizationContext: useBackgroundLocalizationContext,
});
