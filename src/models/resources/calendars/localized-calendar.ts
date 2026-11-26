import z from "zod";
import { translate } from "~/i18n/i18n-string";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Calendar, calendarSchema } from "./calendar";

//------------------------------------------------------------------------------
// Localized Calendar
//------------------------------------------------------------------------------

export const localizedCalendarSchema = localizedResourceSchema(
  calendarSchema,
  z.literal("calendar"),
).extend({
  eras: localizedFieldSchema,
  first_day_of_first_year_weekday: localizedFieldSchema,
  months: localizedFieldSchema,
  weekdays: localizedFieldSchema,
});

export type LocalizedCalendar = z.infer<typeof localizedCalendarSchema>;

//------------------------------------------------------------------------------
// Calendar Localization Context
//------------------------------------------------------------------------------

type CalendarLocalizationContext = ResourceLocalizationContext;

//------------------------------------------------------------------------------
// Use Calendar Localization Context
//------------------------------------------------------------------------------

export function useCalendarLocalizationContext(): CalendarLocalizationContext {
  return useResourceLocalizationContext(i18nContext);
}

//------------------------------------------------------------------------------
// Localize Calendar
//------------------------------------------------------------------------------

export function localizeCalendar(
  calendar: Calendar,
  context: CalendarLocalizationContext,
): LocalizedCalendar {
  const weekdays = calendar.weekdays.map(({ name }) => translate(name, context.lang));
  const weekday =
    calendar.first_day_of_first_year_weekday_index === null
      ? undefined
      : weekdays[calendar.first_day_of_first_year_weekday_index];
  const eras = calendar.eras.map(({ name, short_name }) => {
    const localizedName = translate(name, context.lang);
    const localizedShortName = translate(short_name, context.lang);
    const eraName = localizedShortName
      ? localizedName + " (" + localizedShortName + ")"
      : localizedName;
    return eraName;
  });
  const months = calendar.months.map(
    ({
      additional_days_count,
      additional_days_every_years,
      additional_days_first_year,
      advances_weekday_cycle,
      days_count,
      name,
    }) => {
      const localizedName = translate(name, context.lang) || context.t("unnamed_month");
      const days =
        additional_days_count > 0
          ? context.ti(
              "month_days",
              context.tpi("days", days_count, String(days_count)),
              context.tpi("additional_days", additional_days_count, String(additional_days_count)),
            )
          : context.tpi("days", days_count, String(days_count));
      const recurrence =
        additional_days_count > 0 &&
        additional_days_every_years > 0 &&
        additional_days_first_year > 0
          ? context.ti(
              "month_days_recurrence",
              String(additional_days_every_years),
              String(additional_days_first_year),
            )
          : "";
      const weekdayCycle = advances_weekday_cycle
        ? ""
        : " (" + context.t("does_not_advance_weekday_cycle") + ")";
      return localizedName + " (" + days + recurrence + ")" + weekdayCycle;
    },
  );

  return {
    ...localizeResource(calendar, context),
    descriptor: context.t("calendar_descriptor"),
    eras: {
      label: context.t("eras"),
      value: eras.join(", "),
    },
    first_day_of_first_year_weekday: {
      label: context.t("first_day_of_first_year_weekday"),
      value: weekday ?? "",
    },
    months: {
      label: context.tp("months", calendar.months.length),
      value: months.join(", "),
    },
    weekdays: {
      label: context.tp("weekdays", calendar.weekdays.length),
      value: weekdays.join(", "),
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "additional_days/*": { en: "<1> additional days", it: "<1> giorni aggiuntivi" },
  "additional_days/1": { en: "<1> additional day", it: "<1> giorno aggiuntivo" },
  "calendar_descriptor": { en: "Calendar", it: "Calendario" },
  "days/*": { en: "<1> days", it: "<1> giorni" },
  "days/1": { en: "<1> day", it: "<1> giorno" },
  "does_not_advance_weekday_cycle": {
    en: "does not advance the weekday cycle",
    it: "non avanza il ciclo dei giorni della settimana",
  },
  "eras": { en: "Eras", it: "Ere" },
  "first_day_of_first_year_weekday": {
    en: "Weekday of the first day of year 1",
    it: "Giorno della settimana del primo giorno dell'anno 1",
  },
  "month_days": {
    en: "<1> + <2>",
    it: "<1> + <2>",
  },
  "month_days_recurrence": {
    en: ", every <1> years starting from year <2>",
    it: ", ogni <1> anni a partire dall'anno <2>",
  },
  "months/*": { en: "Months", it: "Mesi" },
  "months/1": { en: "Month", it: "Mese" },
  "unnamed_month": { en: "Unnamed period", it: "Periodo senza nome" },
  "weekdays/*": { en: "Weekdays", it: "Giorni della settimana" },
  "weekdays/1": { en: "Weekday", it: "Giorno della settimana" },
};
