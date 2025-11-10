import { useMemo } from "react";
import z from "zod";
import { useI18nLangContext } from "./i18n-lang-context";
import {
  computeMeasureRegex,
  parseMeasure,
  useTranslateMeasure,
} from "./i18n-measure";

//------------------------------------------------------------------------------
// Time
//------------------------------------------------------------------------------

export const timeUnitsSchema = z.enum(["round", "s", "min", "hr", "d"]);
export const timeUnits = timeUnitsSchema.options;
export type TimeUnit = z.infer<typeof timeUnitsSchema>;

export const timeRegex = computeMeasureRegex(timeUnits);

export const timeSchema = z.string().regex(timeRegex);

//------------------------------------------------------------------------------
// Parse Time
//------------------------------------------------------------------------------

export function parseTime(time: string) {
  return parseMeasure<TimeUnit>(time, timeUnits, "min");
}

//------------------------------------------------------------------------------
// Use Translate Time
//------------------------------------------------------------------------------

export function useTranslateTime(
  format: "long" | "short" = "short",
): (raw: string) => string {
  return useTranslateMeasure<TimeUnit>(i18Context, timeUnits, "min", format);
}

//------------------------------------------------------------------------------
// Use Time Unit Options
//------------------------------------------------------------------------------

export function useTimeUnitOptions(format: "long" | "short" = "short") {
  const { t } = useI18nLangContext(i18Context);

  return useMemo(
    () =>
      timeUnits.map((unit) => ({
        label: t(`${unit}.unit.${format}`),
        value: unit,
      })),
    [format, t],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18Context = {
  "d.unit.long": { en: "Days", it: "Giorni" },
  "hr.unit.long": { en: "Hours", it: "Ore" },
  "min.unit.long": { en: "Minutes", it: "Minuti" },
  "round.unit.long": { en: "Rounds", it: "Round" },
  "s.unit.long": { en: "Seconds", it: "Secondi" },

  "d.unit.short": { en: "d", it: "g" },
  "hr.unit.short": { en: "hr", it: "h" },
  "min.unit.short": { en: "min", it: "min" },
  "round.unit.short": { en: "rnd", it: "rnd" },
  "s.unit.short": { en: "s", it: "s" },

  "d.long/*": { en: "<1> days", it: "<1> giorni" },
  "d.long/1": { en: "<1> day", it: "<1> giorno" },
  "hr.long/*": { en: "<1> hours", it: "<1> ore" },
  "hr.long/1": { en: "<1> hour", it: "<1> ora" },
  "min.long/*": { en: "<1> minutes", it: "<1> minuti" },
  "min.long/1": { en: "<1> minute", it: "<1> minuto" },
  "round.long/*": { en: "<1> rounds", it: "<1> round" },
  "round.long/1": { en: "<1> round", it: "<1> round" },
  "s.long/*": { en: "<1> seconds", it: "<1> secondi" },
  "s.long/1": { en: "<1> second", it: "<1> secondo" },

  "d.short/*": { en: "<1> days", it: "<1> giorni" },
  "d.short/1": { en: "<1> day", it: "<1> giorno" },
  "hr.short/*": { en: "<1> hours", it: "<1> ore" },
  "hr.short/1": { en: "<1> hour", it: "<1> ora" },
  "min.short/*": { en: "<1> min.", it: "<1> min." },
  "min.short/1": { en: "<1> min.", it: "<1> min." },
  "round.short/*": { en: "<1> rounds", it: "<1> round" },
  "round.short/1": { en: "<1> round", it: "<1> round" },
  "s.short/*": { en: "<1> s", it: "<1> s" },
  "s.short/1": { en: "<1> s", it: "<1> s" },
};
