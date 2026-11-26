import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Calendar Month
//------------------------------------------------------------------------------

export const calendarMonthSchema = z.object({
  additional_days_count: z.number().int().nonnegative().default(0),
  additional_days_every_years: z.number().int().nonnegative().default(0),
  additional_days_first_year: z.number().int().nonnegative().default(0),
  advances_weekday_cycle: z.boolean().default(true),
  days_count: z.number().int().nonnegative(),
  name: i18nStringSchema,
});

//------------------------------------------------------------------------------
// Calendar Weekday
//------------------------------------------------------------------------------

export const calendarWeekdaySchema = z.object({
  name: i18nStringSchema,
});

//------------------------------------------------------------------------------
// Calendar Era
//------------------------------------------------------------------------------

export const calendarEraSchema = z.object({
  name: i18nStringSchema,
  short_name: i18nStringSchema.default({}),
});

//------------------------------------------------------------------------------
// Calendar
//------------------------------------------------------------------------------

export const calendarSchema = resourceSchema
  .extend({
    eras: z.array(calendarEraSchema).default([]),
    first_day_of_first_year_weekday_index: z.number().int().nonnegative().nullable().default(null),
    kind: z.literal("calendar"),
    months: z.array(calendarMonthSchema).default([]),
    weekdays: z.array(calendarWeekdaySchema).default([]),
  })
  .superRefine((calendar, context) => {
    if (
      calendar.first_day_of_first_year_weekday_index !== null &&
      calendar.first_day_of_first_year_weekday_index >= calendar.weekdays.length
    ) {
      context.addIssue({
        code: "custom",
        message: "The first weekday must reference a weekday in this calendar",
        path: ["first_day_of_first_year_weekday_index"],
      });
    }
  });

export type Calendar = z.infer<typeof calendarSchema>;

//------------------------------------------------------------------------------
// Default Calendar
//------------------------------------------------------------------------------

export const defaultCalendar: Calendar = {
  ...defaultResource,
  eras: [],
  first_day_of_first_year_weekday_index: null,
  kind: "calendar",
  months: [],
  weekdays: [],
};

//------------------------------------------------------------------------------
// Calendar Translation Fields
//------------------------------------------------------------------------------

export const calendarTranslationFields: TranslationFields<Calendar>[] = [
  ...resourceTranslationFields,
];
