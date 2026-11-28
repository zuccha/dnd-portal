import type { Calendar } from "~/models/resources/calendars/calendar";
import {
  calendarForm,
  calendarFormDataToResource,
} from "~/models/resources/calendars/calendar-form";
import { calendarStore } from "~/models/resources/calendars/calendar-store";
import type { LocalizedCalendar } from "~/models/resources/calendars/localized-calendar";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import { createCalendarEditor } from "./calendar-editor";
import CalendarDetail from "./detail/calendar-detail";
import { CalendarCard } from "./panel/calendar-card";
import CalendarsFilters from "./panel/calendars-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Calendar, LocalizedCalendar>([]);

//------------------------------------------------------------------------------
// Calendar Module
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  calendarStore,
  { initialPaletteName: "moss", path: Route.ResourcesChronologyCalendars },
  {
    album: { AlbumCard: CalendarCard },
    detail: { Detail: CalendarDetail },
    filters: { Filters: CalendarsFilters },
    form: {
      Editor: createCalendarEditor(calendarForm),
      form: calendarForm,
      parseFormData: calendarFormDataToResource,
    },
    table: { columns },
  },
);
