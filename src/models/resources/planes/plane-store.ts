import { createResourceStore } from "../resource-store";
import { useLocalizePlane } from "./localized-plane";
import { defaultPlane, planeSchema, planeTranslationFields } from "./plane";
import {
  defaultPlaneFilters,
  planeFiltersSchema,
  planeOrderOptions,
} from "./plane-filters";

//------------------------------------------------------------------------------
// Plane Store
//------------------------------------------------------------------------------

export const planeStore = createResourceStore(
  { p: "planes", s: "plane" },
  {
    defaultFilters: defaultPlaneFilters,
    defaultResource: defaultPlane,
    filtersSchema: planeFiltersSchema,
    kinds: ["plane"],
    orderOptions: planeOrderOptions,
    resourceSchema: planeSchema,
    translationFields: planeTranslationFields,
    useLocalizeResource: useLocalizePlane,
  },
);
