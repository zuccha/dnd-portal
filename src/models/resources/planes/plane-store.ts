import { matchesInclusion, matchesInclusionList } from "../resource-filtering";
import { createResourceStore } from "../resource-store";
import { useLocalizePlane } from "./localized-plane";
import { defaultPlane } from "./plane";
import {
  defaultPlaneFilters,
  planeFiltersSchema,
  planeOrderOptions,
} from "./plane-filters";

//------------------------------------------------------------------------------
// Plane Store
//------------------------------------------------------------------------------

export const planeStore = createResourceStore("plane", {
  defaultFilters: defaultPlaneFilters,
  defaultResource: defaultPlane,
  displayName: { en: "Planes", it: "Piani" },
  filtersSchema: planeFiltersSchema,
  matchesResource: (plane, filters) =>
    matchesInclusion(plane.category, filters.categories) &&
    matchesInclusionList(plane.alignments, filters.alignments),
  orderOptions: planeOrderOptions,
  useLocalizeResource: useLocalizePlane,
});
