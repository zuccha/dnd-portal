import z from "zod";
import { useTranslateMeasure } from "./i18n-measure";

//------------------------------------------------------------------------------
// Time
//------------------------------------------------------------------------------

const timeUnits = ["round", "s", "min", "hr", "d"];

export const timeRegex = new RegExp(`^\\d+\\s*(${timeUnits.join("|")})$`);

export const timeSchema = z.string().regex(timeRegex);

//------------------------------------------------------------------------------
// Use Translate Time
//------------------------------------------------------------------------------

export function useTranslateTime(
  format: "long" | "short" = "short"
): (raw: string) => string {
  return useTranslateMeasure(i18Context, timeUnits, format);
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18Context = {
  "d.long/*": { en: "<1> days", it: "<1> giorni" },
  "d.long/1": { en: "<1> day", it: "<1> giorno" },
  "hr.long/*": { en: "<1> hours", it: "<1> ore" },
  "hr.long/1": { en: "<1> hour", it: "<1> ora" },
  "min.long/*": { en: "<1> minutes", it: "<1> minuti" },
  "min.long/1": { en: "<1> minute", it: "<1> minuto" },
  "round.long/*": { en: "<1> rounds", it: "<1> round" },
  "round.long/1": { en: "<1> round", it: "<1> round" },

  "d.short/*": { en: "<1> days", it: "<1> giorni" },
  "d.short/1": { en: "<1> day", it: "<1> giorno" },
  "hr.short/*": { en: "<1> hours", it: "<1> ore" },
  "hr.short/1": { en: "<1> hour", it: "<1> ora" },
  "min.short/*": { en: "<1> min.", it: "<1> min." },
  "min.short/1": { en: "<1> min.", it: "<1> min." },
  "round.short/*": { en: "<1> rounds", it: "<1> round" },
  "round.short/1": { en: "<1> round", it: "<1> round" },
};
