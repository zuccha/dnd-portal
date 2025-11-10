import { useCallback } from "react";
import type { I18nLangContext } from "./i18n-lang";
import { useI18nLangContext } from "./i18n-lang-context";

//------------------------------------------------------------------------------
// Compute Measure Regex
//------------------------------------------------------------------------------

export function computeMeasureRegex(units: string[]) {
  return new RegExp(
    `^(?<value>\\d+(?:\\.\\d+)?)\\s*(?<unit>${units.join("|")})$`,
  );
}

//------------------------------------------------------------------------------
// Parse Measure
//------------------------------------------------------------------------------

export function parseMeasure<U extends string>(
  measure: string,
  units: U[],
  fallbackUnit: U,
): [number, U] {
  const regex = computeMeasureRegex(units);
  const match = measure.match(regex);
  if (!match || !match.groups) return [0, fallbackUnit];

  const unit = match.groups["unit"];
  const value = parseFloat(match.groups["value"]) || 0;
  return [value, unit as U];
}

//------------------------------------------------------------------------------
// Use Translate Measure
//------------------------------------------------------------------------------

export function useTranslateMeasure<U extends string>(
  context: I18nLangContext,
  units: U[],
  fallbackUnit: U,
  format: "long" | "short" = "short",
): (raw: string) => string {
  const { tpi } = useI18nLangContext(context);

  return useCallback(
    (measure: string) => {
      const result = parseMeasure(measure, units, fallbackUnit);
      if (!result) return measure;

      const [value, unit] = result;
      return tpi(`${unit}.${format}`, value, `${value}`);
    },
    [fallbackUnit, format, tpi, units],
  );
}
