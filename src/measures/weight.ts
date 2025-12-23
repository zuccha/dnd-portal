import { useCallback, useMemo } from "react";
import z from "zod";
import { formatNumber } from "~/utils/number";
import { useI18nLangContext } from "../i18n/i18n-lang-context";
import { useI18nSystem } from "../i18n/i18n-system";

//------------------------------------------------------------------------------
// Weight Unit
//------------------------------------------------------------------------------

export const weightUnitSchema = z.enum(["g", "kg", "lb"]);

export type WeightUnit = z.infer<typeof weightUnitSchema>;

export const weightUnitOptions = weightUnitSchema.options;

//------------------------------------------------------------------------------
// Weight
//------------------------------------------------------------------------------

export const weightSchema = z.object({
  unit: weightUnitSchema,
  value: z.number(),
});

export type Weight = z.infer<typeof weightSchema>;

//------------------------------------------------------------------------------
// Conversions
//------------------------------------------------------------------------------

const gInKg = 1000;
const gInLb = 500;

const gIn = {
  g: 1,
  kg: gInKg,
  lb: gInLb,
};

//------------------------------------------------------------------------------
// G to Weight Value
//------------------------------------------------------------------------------

export function gToWeightValue(g: number, unit: WeightUnit): number {
  return g / gIn[unit];
}

//------------------------------------------------------------------------------
// G to Weight Imp
//------------------------------------------------------------------------------

export function gToWeightImp(g: number): Weight {
  return { unit: "g", value: g / gInLb };
}

//------------------------------------------------------------------------------
// G to Weight Met
//------------------------------------------------------------------------------

export function gToWeightMet(g: number): Weight {
  if (g < gInKg) return { unit: "g", value: g };
  return { unit: "kg", value: g / gInKg };
}

//------------------------------------------------------------------------------
// Weight to G
//------------------------------------------------------------------------------

export function weightToG(weight: Weight): number {
  return gIn[weight.unit] * weight.value;
}

//------------------------------------------------------------------------------
// Use Weight Unit Options
//------------------------------------------------------------------------------

export function useWeightUnitOptions(format: "long" | "short" = "short") {
  const { t } = useI18nLangContext(i18nContext);

  return useMemo(() => {
    return weightUnitOptions.map((unit) => ({
      label: t(`${unit}.unit.${format}`),
      value: unit,
    }));
  }, [format, t]);
}

//------------------------------------------------------------------------------
// Use Format G
//------------------------------------------------------------------------------

export function useFormatG() {
  const { tpi } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  return useCallback(
    (g: number, format: "long" | "short" = "short") => {
      const { unit, value } =
        system === "metric" ? gToWeightMet(g) : gToWeightImp(g);
      return tpi(`${unit}.${format}`, value, formatNumber(value));
    },
    [system, tpi],
  );
}

//------------------------------------------------------------------------------
// Use Format G With Unit
//------------------------------------------------------------------------------

export function useFormatGWithUnit(unit: WeightUnit) {
  const { tpi } = useI18nLangContext(i18nContext);

  return useCallback(
    (g: number, format: "long" | "short" = "short") => {
      const value = g / gIn[unit];
      return tpi(`${unit}.${format}`, value, formatNumber(value));
    },
    [tpi, unit],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "g.unit.long": { en: "Grams", it: "Grammi" },
  "kg.unit.long": { en: "Kilometers", it: "Chilometri" },
  "lb.unit.long": { en: "Pounds", it: "Libbre" },

  "g.unit.short": { en: "g", it: "g" },
  "kg.unit.short": { en: "kg", it: "kg" },
  "lb.unit.short": { en: "lb", it: "lb" },

  "g.long/*": { en: "<1> grams", it: "<1> grammi" },
  "g.long/1": { en: "<1> gram", it: "<1> grammo" },
  "kg.long/*": { en: "<1> kilometers", it: "<1> chilometri" },
  "kg.long/1": { en: "<1> kilometer", it: "<1> chilometro" },
  "lb.long/*": { en: "<1> pounds", it: "<1> libbre" },
  "lb.long/1": { en: "<1> pound", it: "<1> libbra" },

  "g.short/*": { en: "<1> g", it: "<1> g" },
  "g.short/1": { en: "<1> g", it: "<1> g" },
  "kg.short/*": { en: "<1> kg", it: "<1> kg" },
  "kg.short/1": { en: "<1> kg", it: "<1> kg" },
  "lb.short/*": { en: "<1> lb", it: "<1> lb" },
  "lb.short/1": { en: "<1> lb", it: "<1> lb" },
};
