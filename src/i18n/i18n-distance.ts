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

export const distanceImpUnitsSchema = z.enum(["ft", "mi"]);
export const distanceImpUnits = distanceImpUnitsSchema.options;
export type DistanceImpUnit = z.infer<typeof distanceImpUnitsSchema>;

export const distanceMetUnitsSchema = z.enum(["m", "km"]);
export const distanceMetUnits = distanceMetUnitsSchema.options;
export type DistanceMetUnit = z.infer<typeof distanceMetUnitsSchema>;

export const distanceUnits = [...distanceImpUnits, ...distanceMetUnits];
export type DistanceUnit = (typeof distanceUnits)[number];

export const distanceImpRegex = computeMeasureRegex(distanceImpUnits);
export const distanceMetRegex = computeMeasureRegex(distanceMetUnits);

export const distanceImpSchema = z.string().regex(distanceImpRegex);
export const distanceMetSchema = z.string().regex(distanceMetRegex);

const mInKm = 1000;
const ftInMi = 5000;
const ftToMRatio = 3 / 10;
const mToFtRatio = 10 / 3;

//------------------------------------------------------------------------------
// Parse Distance Imp
//------------------------------------------------------------------------------

export function parseDistanceImp(distance: string) {
  return parseMeasure<DistanceImpUnit>(distance, distanceImpUnits, "ft");
}

//------------------------------------------------------------------------------
// Parse Distance Met
//------------------------------------------------------------------------------

export function parseDistanceMet(distance: string) {
  return parseMeasure<DistanceMetUnit>(distance, distanceMetUnits, "m");
}

//------------------------------------------------------------------------------
// Convert Distance Imp To Met
//------------------------------------------------------------------------------

export function convertDistanceImpToMet(
  value: number,
  unit: string,
  outUnit?: "m" | "km",
): [number, "m" | "km"] {
  const m =
    {
      ft: value * ftToMRatio,
      mi: value * ftInMi * ftToMRatio,
    }[unit] ?? 0;
  if (outUnit === "m") return [m, "m"];
  if (outUnit === "km") return [m / mInKm, "km"];
  return m < mInKm ? [m, "m"] : [m / mInKm, "km"];
}

//------------------------------------------------------------------------------
// Convert Distance Met To Imp
//------------------------------------------------------------------------------

export function convertDistanceMetToImp(
  value: number,
  unit: string,
  outUnit?: "ft" | "mi",
): [number, "ft" | "mi"] {
  const ft =
    {
      km: value * mInKm * mToFtRatio,
      m: value * mToFtRatio,
    }[unit] ?? 0;
  if (outUnit === "ft") return [ft, "ft"];
  if (outUnit === "mi") return [ft / ftInMi, "mi"];
  return ft < ftInMi ? [ft, "ft"] : [ft / ftInMi, "mi"];
}

//------------------------------------------------------------------------------
// Use Translate Distance Imp
//------------------------------------------------------------------------------

export function useTranslateDistanceImp(
  format: "long" | "short" = "short",
): (raw: string) => string {
  return useTranslateMeasure<DistanceImpUnit>(
    i18Context,
    distanceImpUnits,
    "ft",
    format,
  );
}

//------------------------------------------------------------------------------
// Use Translate Distance Met
//------------------------------------------------------------------------------

export function useTranslateDistanceMet(
  format: "long" | "short" = "short",
): (raw: string) => string {
  return useTranslateMeasure<DistanceMetUnit>(
    i18Context,
    distanceMetUnits,
    "m",
    format,
  );
}

//------------------------------------------------------------------------------
// Use Distance Imp Unit Options
//------------------------------------------------------------------------------

export function useDistanceImpUnitOptions(format: "long" | "short" = "short") {
  const { t } = useI18nLangContext(i18Context);

  return useMemo(
    () =>
      distanceImpUnits.map((unit) => ({
        label: t(`${unit}.unit.${format}`),
        value: unit,
      })),
    [format, t],
  );
}

//------------------------------------------------------------------------------
// Use Distance Met Unit Options
//------------------------------------------------------------------------------

export function useDistanceMetUnitOptions(format: "long" | "short" = "short") {
  const { t } = useI18nLangContext(i18Context);

  return useMemo(
    () =>
      distanceMetUnits.map((unit) => ({
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
  "cm.unit.long": { en: "Centimeters", it: "Centimetri" },
  "ft.unit.long": { en: "Feet", it: "Piedi" },
  "km.unit.long": { en: "Kilometers", it: "Chilometri" },
  "m.unit.long": { en: "Meters", it: "Metri" },
  "mi.unit.long": { en: "Miles", it: "Miglia" },

  "cm.unit.short": { en: "cm", it: "cm" },
  "ft.unit.short": { en: "ft", it: "ft" },
  "km.unit.short": { en: "km", it: "km" },
  "m.unit.short": { en: "m", it: "m" },
  "mi.unit.short": { en: "mi", it: "mi" },

  "cm.long/*": { en: "<1> centimeters", it: "<1> centimetri" },
  "cm.long/1": { en: "<1> centimeter", it: "<1> centimetro" },
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
