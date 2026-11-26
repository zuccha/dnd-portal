import { createResourceStore } from "../resource-store";
import { defaultCalendar, calendarTranslationFields } from "./calendar";
import {
  calendarFiltersSchema,
  calendarOrderOptions,
  defaultCalendarFilters,
} from "./calendar-filters";
import { localizeCalendar, useCalendarLocalizationContext } from "./localized-calendar";

//------------------------------------------------------------------------------
// Calendar Store
//------------------------------------------------------------------------------

export const calendarStore = createResourceStore("calendar", {
  defaultFilters: defaultCalendarFilters,
  defaultResource: defaultCalendar,
  displayName: { en: "Calendars", it: "Calendari" },
  filtersSchema: calendarFiltersSchema,
  orderOptions: calendarOrderOptions,
  translationFields: calendarTranslationFields,
  localizeResource: localizeCalendar,
  useLocalizationContext: useCalendarLocalizationContext,
});
