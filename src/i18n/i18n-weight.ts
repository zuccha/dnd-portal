import { useMemo } from "react";
import z from "zod";
import { useI18nLangContext } from "./i18n-lang-context";
import {
  computeMeasureRegex,
  parseMeasure,
  useTranslateMeasure,
} from "./i18n-measure";

//------------------------------------------------------------------------------
// Weight
//------------------------------------------------------------------------------

export const weightImpUnits = ["lb"];
export const weightMetUnits = ["kg"];
export const weightUnits = [...weightImpUnits, ...weightMetUnits];

export const weightImpRegex = computeMeasureRegex(weightImpUnits);
export const weightMetRegex = computeMeasureRegex(weightMetUnits);

export const weightImpSchema = z.string().regex(weightImpRegex);
export const weightMetSchema = z.string().regex(weightMetRegex);

const kgToLbRatio = 2;
const lbToKgRatio = 1 / 2;

//------------------------------------------------------------------------------
// Parse Weight Imp
//------------------------------------------------------------------------------

export function parseWeightImp(weight: string) {
  return parseMeasure(weight, weightImpUnits);
}

//------------------------------------------------------------------------------
// Parse Weight Met
//------------------------------------------------------------------------------

export function parseWeightMet(weight: string) {
  return parseMeasure(weight, weightMetUnits);
}

//------------------------------------------------------------------------------
// Convert Weight Imp To Met
//------------------------------------------------------------------------------

export function convertWeightImpToMet(
  value: number,
  unit: string,
  _outUnit?: "kg"
): [number, "kg"] {
  const kg = { lb: value * lbToKgRatio }[unit] ?? 0;
  return [kg, "kg"];
}

//------------------------------------------------------------------------------
// Convert Weight Met To Imp
//------------------------------------------------------------------------------

export function convertWeightMetToImp(
  value: number,
  unit: string,
  _outUnit?: "lb"
): [number, "lb"] {
  const lb = { kg: value * kgToLbRatio }[unit] ?? 0;
  return [lb, "lb"];
}

//------------------------------------------------------------------------------
// Use Translate Weight
//------------------------------------------------------------------------------

export function useTranslateWeight(
  format: "long" | "short" = "short"
): (raw: string) => string {
  return useTranslateMeasure(i18Context, weightUnits, format);
}

//------------------------------------------------------------------------------
// Use Weight Imp Unit Options
//------------------------------------------------------------------------------

export function useWeightImpUnitOptions(format: "long" | "short" = "short") {
  const { t } = useI18nLangContext(i18Context);

  return useMemo(
    () =>
      weightImpUnits.map((unit) => ({
        label: t(`${unit}.unit.${format}`),
        value: unit,
      })),
    [format, t]
  );
}

//------------------------------------------------------------------------------
// Use Weight Met Unit Options
//------------------------------------------------------------------------------

export function useWeightMetUnitOptions(format: "long" | "short" = "short") {
  const { t } = useI18nLangContext(i18Context);

  return useMemo(
    () =>
      weightMetUnits.map((unit) => ({
        label: t(`${unit}.unit.${format}`),
        value: unit,
      })),
    [format, t]
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18Context = {
  "kg.unit.long": { en: "Kilometers", it: "Chilometri" },
  "lb.unit.long": { en: "Pounds", it: "Libbre" },

  "kg.unit.short": { en: "kg", it: "kg" },
  "lb.unit.short": { en: "lb", it: "lb" },

  "kg.long/*": { en: "<1> kilometers", it: "<1> chilometri" },
  "kg.long/1": { en: "<1> kilometer", it: "<1> chilometro" },
  "lb.long/*": { en: "<1> pounds", it: "<1> libbre" },
  "lb.long/1": { en: "<1> pound", it: "<1> libbra" },

  "kg.short/*": { en: "<1> kg", it: "<1> kg" },
  "kg.short/1": { en: "<1> kg", it: "<1> kg" },
  "lb.short/*": { en: "<1> lb", it: "<1> lb" },
  "lb.short/1": { en: "<1> lb", it: "<1> lb" },
};
