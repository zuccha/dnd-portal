import { useCallback, useMemo } from "react";
import z from "zod";
import { formatNumber } from "~/utils/number";
import { useI18nLangContext } from "../i18n/i18n-lang-context";

//------------------------------------------------------------------------------
// Time Unit
//------------------------------------------------------------------------------

export const timeUnitSchema = z.enum(["s", "rnd", "min", "hr", "d"]);

export type TimeUnit = z.infer<typeof timeUnitSchema>;

export const timeUnitOptions = timeUnitSchema.options;

//------------------------------------------------------------------------------
// Time
//------------------------------------------------------------------------------

export const timeSchema = z.object({
  unit: timeUnitSchema,
  value: z.number(),
});

export type Time = z.infer<typeof timeSchema>;

//------------------------------------------------------------------------------
// Conversions
//------------------------------------------------------------------------------

const secondsInRound = 6;
const secondsInMinute = secondsInRound * 10;
const secondsInHour = secondsInMinute * 60;
const secondsInDay = secondsInHour * 24;

const secondsIn = {
  d: secondsInDay,
  hr: secondsInHour,
  min: secondsInMinute,
  rnd: secondsInRound,
  s: 1,
};

//------------------------------------------------------------------------------
// Seconds to Time Value
//------------------------------------------------------------------------------

export function secondsToTimeValue(s: number, unit: TimeUnit): number {
  return s / secondsIn[unit];
}

//------------------------------------------------------------------------------
// Seconds to Time
//------------------------------------------------------------------------------

export function secondsToTime(s: number): Time {
  if (s === secondsInRound) return { unit: "rnd", value: s / secondsInRound };
  if (s < secondsInMinute) return { unit: "s", value: s };
  if (s < secondsInHour) return { unit: "min", value: s / secondsInMinute };
  if (s < secondsInDay) return { unit: "hr", value: s / secondsInHour };
  return { unit: "d", value: s / secondsInDay };
}

//------------------------------------------------------------------------------
// Time to Seconds
//------------------------------------------------------------------------------

export function timeToSeconds(time: Time): number {
  return secondsIn[time.unit] * time.value;
}

//------------------------------------------------------------------------------
// Use Time Unit Options
//------------------------------------------------------------------------------

export function useTimeUnitOptions(format: "long" | "short" = "short") {
  const { t } = useI18nLangContext(i18nContext);

  return useMemo(() => {
    return timeUnitOptions.map((unit) => ({
      label: t(`${unit}.unit.${format}`),
      value: unit,
    }));
  }, [format, t]);
}

//------------------------------------------------------------------------------
// Use Format Seconds
//------------------------------------------------------------------------------

export function useFormatSeconds() {
  const { tpi } = useI18nLangContext(i18nContext);

  return useCallback(
    (s: number, format: "long" | "short" = "short") => {
      const { unit, value } = secondsToTime(s);
      return tpi(`${unit}.${format}`, value, formatNumber(value));
    },
    [tpi],
  );
}

//------------------------------------------------------------------------------
// Use Format Seconds With Unit
//------------------------------------------------------------------------------

export function useFormatSecondsWithUnit(unit: TimeUnit) {
  const { tpi } = useI18nLangContext(i18nContext);

  return useCallback(
    (s: number, format: "long" | "short" = "short") => {
      const value = s / secondsIn[unit];
      return tpi(`${unit}.${format}`, value, formatNumber(value));
    },
    [tpi, unit],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "d.unit.long": { en: "Days", it: "Giorni" },
  "hr.unit.long": { en: "Hours", it: "Ore" },
  "min.unit.long": { en: "Minutes", it: "Minuti" },
  "rnd.unit.long": { en: "Rounds", it: "Round" },
  "s.unit.long": { en: "Seconds", it: "Secondi" },

  "d.unit.short": { en: "d", it: "g" },
  "hr.unit.short": { en: "hr", it: "h" },
  "min.unit.short": { en: "min", it: "min" },
  "rnd.unit.short": { en: "rnd", it: "rnd" },
  "s.unit.short": { en: "s", it: "s" },

  "d.long/*": { en: "<1> days", it: "<1> giorni" },
  "d.long/1": { en: "<1> day", it: "<1> giorno" },
  "hr.long/*": { en: "<1> hours", it: "<1> ore" },
  "hr.long/1": { en: "<1> hour", it: "<1> ora" },
  "min.long/*": { en: "<1> minutes", it: "<1> minuti" },
  "min.long/1": { en: "<1> minute", it: "<1> minuto" },
  "rnd.long/*": { en: "<1> rounds", it: "<1> round" },
  "rnd.long/1": { en: "<1> round", it: "<1> round" },
  "s.long/*": { en: "<1> seconds", it: "<1> secondi" },
  "s.long/1": { en: "<1> second", it: "<1> secondo" },

  "d.short/*": { en: "<1> days", it: "<1> giorni" },
  "d.short/1": { en: "<1> day", it: "<1> giorno" },
  "hr.short/*": { en: "<1> hours", it: "<1> ore" },
  "hr.short/1": { en: "<1> hour", it: "<1> ora" },
  "min.short/*": { en: "<1> min.", it: "<1> min." },
  "min.short/1": { en: "<1> min.", it: "<1> min." },
  "rnd.short/*": { en: "<1> rounds", it: "<1> round" },
  "rnd.short/1": { en: "<1> round", it: "<1> round" },
  "s.short/*": { en: "<1> s", it: "<1> s" },
  "s.short/1": { en: "<1> s", it: "<1> s" },
};
