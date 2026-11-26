import z from "zod";
import { createForm } from "~/utils/form";
import {
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import { calendarEraSchema, calendarMonthSchema, calendarWeekdaySchema } from "./calendar";
import type { Calendar } from "./calendar";

//------------------------------------------------------------------------------
// Calendar Form Data
//------------------------------------------------------------------------------

export const calendarFormDataSchema = resourceFormDataSchema.extend({
  eras: z.array(calendarEraSchema).default([]),
  first_day_of_first_year_weekday_index: z.number().int().nonnegative().nullable().default(null),
  months: z.array(calendarMonthSchema).default([]),
  weekdays: z.array(calendarWeekdaySchema).default([]),
});

//------------------------------------------------------------------------------
// Calendar Form Data Type
//------------------------------------------------------------------------------

export type CalendarFormData = z.infer<typeof calendarFormDataSchema>;

//------------------------------------------------------------------------------
// Calendar Form Data To Resource
//------------------------------------------------------------------------------

export function calendarFormDataToResource(
  data: Partial<CalendarFormData>,
  lang: string,
): Partial<Calendar> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    eras: data.eras,
    first_day_of_first_year_weekday_index: data.first_day_of_first_year_weekday_index,
    months: data.months,
    weekdays: data.weekdays,
  });
}

//------------------------------------------------------------------------------
// Calendar Form
//------------------------------------------------------------------------------

export const calendarForm = createForm("calendar", calendarFormDataSchema.parse);
