import {
  compareChronicleDateToMaximum,
  compareChronicleDateToMinimum,
} from "~/models/other/chronicle-date";
import { createResourceStore } from "../resource-store";
import { defaultChronicleEntry, chronicleEntryTranslationFields } from "./chronicle-entry";
import {
  chronicleEntryFiltersSchema,
  chronicleEntryOrderOptions,
  defaultChronicleEntryFilters,
} from "./chronicle-entry-filters";
import {
  localizeChronicleEntry,
  useChronicleEntryLocalizationContext,
} from "./localized-chronicle-entry";

//------------------------------------------------------------------------------
// Chronicle Entry Store
//------------------------------------------------------------------------------

export const chronicleEntryStore = createResourceStore("chronicle_entry", {
  defaultFilters: defaultChronicleEntryFilters,
  defaultResource: defaultChronicleEntry,
  displayName: { en: "Chronicle", it: "Cronologia" },
  filtersSchema: chronicleEntryFiltersSchema,
  matchesResource: (entry, filters) =>
    (!filters.date_min || compareChronicleDateToMinimum(entry.date, filters.date_min) >= 0) &&
    (!filters.date_max || compareChronicleDateToMaximum(entry.date, filters.date_max) <= 0),
  localizeResource: localizeChronicleEntry,
  orderOptions: chronicleEntryOrderOptions,
  translationFields: chronicleEntryTranslationFields,
  useLocalizationContext: useChronicleEntryLocalizationContext,
});
