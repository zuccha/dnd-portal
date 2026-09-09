import { createResourceStore } from "../resource-store";
import { defaultBackground } from "./background";
import {
  backgroundFiltersSchema,
  backgroundOrderOptions,
  defaultBackgroundFilters,
} from "./background-filters";
import { useLocalizeBackground } from "./localized-background";

//------------------------------------------------------------------------------
// Background Store
//------------------------------------------------------------------------------

export const backgroundStore = createResourceStore("background", {
  defaultFilters: defaultBackgroundFilters,
  defaultResource: defaultBackground,
  displayName: { en: "Backgrounds", it: "Background" },
  filtersSchema: backgroundFiltersSchema,
  orderOptions: backgroundOrderOptions,
  useLocalizeResource: useLocalizeBackground,
});
