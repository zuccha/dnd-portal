import { useMemo } from "react";
import z from "zod";
import { useI18nLangContext } from "./i18n-lang-context";
import {
  computeMeasureRegex,
  parseMeasure,
  useTranslateMeasure,
} from "./i18n-measure";

//------------------------------------------------------------------------------
// Distance
//------------------------------------------------------------------------------

export const distanceImpUnits = ["ft", "mi"];
export const distanceMetUnits = ["m", "km"];
export const distanceUnits = [...distanceImpUnits, ...distanceMetUnits];

export const distanceImpRegex = computeMeasureRegex(distanceImpUnits);
export const distanceMetRegex = computeMeasureRegex(distanceMetUnits);

export const distanceImpSchema = z.string().regex(distanceImpRegex);
export const distanceMetSchema = z.string().regex(distanceMetRegex);

//------------------------------------------------------------------------------
// Parse Distance Imp
//------------------------------------------------------------------------------

export function parseDistanceImp(distance: string) {
  return parseMeasure(distance, distanceImpUnits);
}

//------------------------------------------------------------------------------
// Parse Distance Met
//------------------------------------------------------------------------------

export function parseDistanceMet(distance: string) {
  return parseMeasure(distance, distanceMetUnits);
}

//------------------------------------------------------------------------------
// Convert Distance Imp To Met
//------------------------------------------------------------------------------

const ftToMRatio = 3 / 10;

export function convertDistanceImpToMet(
  value: number,
  unit: string
): [number, "m" | "km"] {
  const m =
    {
      ft: value * ftToMRatio,
      mi: value * 5000 * ftToMRatio,
    }[unit] ?? 0;
  return m < 1000 ? [m, "m"] : [m / 1000, "km"];
}

//------------------------------------------------------------------------------
// Convert Distance Met To Imp
//------------------------------------------------------------------------------

const mToFtRatio = 10 / 3;

export function convertDistanceMetToImp(
  value: number,
  unit: string
): [number, "ft" | "mi"] {
  const ft =
    {
      km: value * 1000 * mToFtRatio,
      m: value * mToFtRatio,
    }[unit] ?? 0;
  return ft < 5000 ? [ft, "ft"] : [ft / 5000, "mi"];
}

//------------------------------------------------------------------------------
// Use Translate Distance
//------------------------------------------------------------------------------

export function useTranslateDistance(
  format: "long" | "short" = "short"
): (raw: string) => string {
  return useTranslateMeasure(i18Context, distanceUnits, format);
}

//------------------------------------------------------------------------------
// Use Distance Imp Unit Options
//------------------------------------------------------------------------------

export function useDistanceImpUnitOptions() {
  const { t } = useI18nLangContext(i18Context);

  return useMemo(
    () =>
      distanceImpUnits.map((unit) => ({
        label: t(`${unit}.unit`),
        value: unit,
      })),
    [t]
  );
}

//------------------------------------------------------------------------------
// Use Distance Met Unit Options
//------------------------------------------------------------------------------

export function useDistanceMetUnitOptions() {
  const { t } = useI18nLangContext(i18Context);

  return useMemo(
    () =>
      distanceMetUnits.map((unit) => ({
        label: t(`${unit}.unit`),
        value: unit,
      })),
    [t]
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18Context = {
  "cm.unit": { en: "Centimeters", it: "Centimetri" },
  "ft.unit": { en: "Feet", it: "Piedi" },
  "km.unit": { en: "Kilometers", it: "Chilometri" },
  "m.unit": { en: "Meters", it: "Metri" },
  "mi.unit": { en: "Miles", it: "Miglia" },

  "cm.long/*": { en: "<1> centimeters", it: "<1> centimetri" },
  "cm.long/1": { en: "<1> centimeters", it: "<1> centimetro" },
  "ft.long/*": { en: "<1> feet", it: "<1> piedi" },
  "ft.long/1": { en: "<1> foot", it: "<1> piede" },
  "km.long/*": { en: "<1> kilometers", it: "<1> chiilometri" },
  "km.long/1": { en: "<1> kilometer", it: "<1> chiilometro" },
  "m.long/*": { en: "<1> meters", it: "<1> metri" },
  "m.long/1": { en: "<1> meter", it: "<1> metro" },
  "mi.long/*": { en: "<1> miles", it: "<1> miglia" },
  "mi.long/1": { en: "<1> mile", it: "<1> miglio" },

  "cm.short/*": { en: "<1> cm", it: "<1> cm" },
  "cm.short/1": { en: "<1> cm", it: "<1> cm" },
  "ft.short/*": { en: "<1> ft", it: "<1> ft" },
  "ft.short/1": { en: "<1> ft", it: "<1> ft" },
  "km.short/*": { en: "<1> km", it: "<1> km" },
  "km.short/1": { en: "<1> km", it: "<1> km" },
  "m.short/*": { en: "<1> m", it: "<1> m" },
  "m.short/1": { en: "<1> m", it: "<1> m" },
  "mi.short/*": { en: "<1> mi", it: "<1> mi" },
  "mi.short/1": { en: "<1> mi", it: "<1> mi" },
};
