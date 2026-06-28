import { createResourceStore } from "../resource-store";
import { useLocalizeManeuver } from "./localized-maneuver";
import {
  defaultManeuver,
  maneuverSchema,
  maneuverTranslationFields,
} from "./maneuver";
import {
  defaultManeuverFilters,
  maneuverFiltersSchema,
  maneuverOrderOptions,
} from "./maneuver-filters";

//------------------------------------------------------------------------------
// Maneuver Store
//------------------------------------------------------------------------------

export const maneuverStore = createResourceStore(
  { p: "maneuvers", s: "maneuver" },
  {
    defaultFilters: defaultManeuverFilters,
    defaultResource: defaultManeuver,
    displayName: { en: "Maneuvers", it: "Manovre" },
    filtersSchema: maneuverFiltersSchema,
    kinds: ["maneuver"],
    orderOptions: maneuverOrderOptions,
    resourceSchema: maneuverSchema,
    translationFields: maneuverTranslationFields,
    useLocalizeResource: useLocalizeManeuver,
  },
);
