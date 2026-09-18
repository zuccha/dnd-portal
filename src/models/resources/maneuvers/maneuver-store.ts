import { createResourceStore } from "../resource-store";
import { localizeManeuver, useManeuverLocalizationContext } from "./localized-maneuver";
import { defaultManeuver, maneuverTranslationFields } from "./maneuver";
import {
  defaultManeuverFilters,
  maneuverFiltersSchema,
  maneuverOrderOptions,
} from "./maneuver-filters";

//------------------------------------------------------------------------------
// Maneuver Store
//------------------------------------------------------------------------------

export const maneuverStore = createResourceStore("maneuver", {
  defaultFilters: defaultManeuverFilters,
  defaultResource: defaultManeuver,
  displayName: { en: "Maneuvers", it: "Manovre" },
  filtersSchema: maneuverFiltersSchema,
  orderOptions: maneuverOrderOptions,
  translationFields: maneuverTranslationFields,
  localizeResource: localizeManeuver,
  useLocalizationContext: useManeuverLocalizationContext,
});
