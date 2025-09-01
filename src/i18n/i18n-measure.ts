import { useCallback } from "react";
import type { I18nLangContext } from "./i18n-lang";
import { useI18nLangContext } from "./i18n-lang-context";

//------------------------------------------------------------------------------
// Compute Measure Regex
//------------------------------------------------------------------------------

export function computeMeasureRegex(units: string[]) {
  return new RegExp(
    `^(?<value>\\d+(?:\\.\\d+)?)\\s*(?<unit>${units.join("|")})$`
  );
}

//------------------------------------------------------------------------------
// Parse Measure
//------------------------------------------------------------------------------

export function parseMeasure(
  measure: string,
  units: string[]
): [number, string] | undefined {
  const regex = computeMeasureRegex(units);
  const match = measure.match(regex);
  if (!match || !match.groups) return undefined;

  const unit = match.groups.unit;
  const value = parseFloat(match.groups.value) || 0;
  return [value, unit];
}

//------------------------------------------------------------------------------
// Use Translate Measure
//------------------------------------------------------------------------------

export function useTranslateMeasure(
  context: I18nLangContext,
  units: string[],
  format: "long" | "short" = "short"
): (raw: string) => string {
  const { tpi } = useI18nLangContext(context);

  return useCallback(
    (measure: string) => {
      const result = parseMeasure(measure, units) ?? [0, ""];
      if (!result) return measure;

      const [value, unit] = result;
      return tpi(`${unit}.${format}`, value, `${value}`);
    },
    [format, tpi, units]
  );
}
