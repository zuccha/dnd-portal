import z from "zod";

//------------------------------------------------------------------------------
// Chronicle Date
//------------------------------------------------------------------------------

export const chronicleDateSchema = z.object({
  day: z.number().int().positive().nullable(),
  era: z.number().int().nullable(),
  hour: z.number().int().nonnegative().nullable(),
  minute: z.number().int().nonnegative().nullable(),
  month: z.number().int().positive().nullable(),
  year: z.number().int().nonnegative().nullable(),
});

export type ChronicleDate = z.infer<typeof chronicleDateSchema>;

//------------------------------------------------------------------------------
// Compare Chronicle Dates
//------------------------------------------------------------------------------

export function compareChronicleDates(first: ChronicleDate, second: ChronicleDate): number {
  for (const key of chronicleDateParts) {
    const firstValue = first[key];
    const secondValue = second[key];
    if (firstValue === secondValue) continue;
    if (firstValue === null) return 1;
    if (secondValue === null) return -1;
    return firstValue - secondValue;
  }

  return 0;
}

//------------------------------------------------------------------------------
// Compare Chronicle Date To Range Boundary
//------------------------------------------------------------------------------

function compareChronicleDateToRangeBoundary(
  date: ChronicleDate,
  boundary: ChronicleDate,
  nullOrder: -1 | 1,
): number {
  for (const key of chronicleDateParts) {
    const dateValue = date[key];
    const boundaryValue = boundary[key];
    if (dateValue === boundaryValue) continue;
    if (dateValue === null) return nullOrder;
    if (boundaryValue === null) return -nullOrder;
    return dateValue - boundaryValue;
  }

  return 0;
}

//------------------------------------------------------------------------------
// Compare Chronicle Date To Minimum
//------------------------------------------------------------------------------

export function compareChronicleDateToMinimum(date: ChronicleDate, minimum: ChronicleDate): number {
  return compareChronicleDateToRangeBoundary(date, minimum, -1);
}

//------------------------------------------------------------------------------
// Compare Chronicle Date To Maximum
//------------------------------------------------------------------------------

export function compareChronicleDateToMaximum(date: ChronicleDate, maximum: ChronicleDate): number {
  return compareChronicleDateToRangeBoundary(date, maximum, 1);
}

//------------------------------------------------------------------------------
// Format Chronicle Date
//------------------------------------------------------------------------------

export function formatChronicleDate(date: ChronicleDate): string {
  let formattedDate = "";

  const era = date.era === null ? "" : String(date.era);
  if (era) formattedDate += era;
  else return formattedDate;

  const year = date.year === null ? "" : String(date.year);
  if (year) formattedDate += `.${year}`;
  else return formattedDate;

  const month = date.month === null ? "" : String(date.month).padStart(2, "0");
  if (month) formattedDate += `-${month}`;
  else return formattedDate;

  const day = date.day === null ? "" : String(date.day).padStart(2, "0");
  if (day) formattedDate += `-${day}`;
  else return formattedDate;

  const hour = date.hour === null ? "" : String(date.hour).padStart(2, "0");
  if (hour) formattedDate += ` ${hour}`;
  else return formattedDate;

  const minute = date.minute === null ? "" : String(date.minute).padStart(2, "0");
  if (minute) formattedDate += `:${minute}`;
  else return formattedDate;

  return formattedDate;
}

//------------------------------------------------------------------------------
// Chronicle Date Parts
//------------------------------------------------------------------------------

const chronicleDateParts = ["era", "year", "month", "day", "hour", "minute"] as const;
