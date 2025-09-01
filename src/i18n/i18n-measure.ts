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
// Use Translate Measure
//------------------------------------------------------------------------------

export function useTranslateMeasure(
  context: I18nLangContext,
  units: string[],
  format: "long" | "short" = "short"
): (raw: string) => string {
  const { tpi } = useI18nLangContext(context);

  return useCallback(
    (raw: string) => {
      const regex = computeMeasureRegex(units);
      const match = raw.match(regex);
      if (!match || !match.groups) return raw;

      const unit = match.groups.unit;
      const value = parseFloat(match.groups.value);
      return tpi(`${unit}.${format}`, value, `${value}`);
    },
    [format, tpi, units]
  );
}
