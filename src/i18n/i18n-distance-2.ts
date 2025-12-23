import { useCallback, useMemo } from "react";
import z from "zod";
import { useI18nLangContext } from "./i18n-lang-context";
import { useI18nSystem } from "./i18n-system";

//------------------------------------------------------------------------------
// Distance Unit
//------------------------------------------------------------------------------

export const distanceUnitSchema = z.enum(["cm", "m", "km", "ft", "mi", "sq"]);

export type DistanceUnit = z.infer<typeof distanceUnitSchema>;

export const distanceUnitOptions = distanceUnitSchema.options;

//------------------------------------------------------------------------------
// Distance
//------------------------------------------------------------------------------

export const distanceSchema = z.object({
  unit: distanceUnitSchema,
  value: z.number(),
});

export type Distance = z.infer<typeof distanceSchema>;

//------------------------------------------------------------------------------
// Conversions
//------------------------------------------------------------------------------

const cmInM = 100;
const cmInKm = cmInM * 1000;
const cmInFt = 30;
const cmInMi = cmInFt * 5000;
const cmInSq = 150;

const cmIn = {
  cm: 1,
  ft: cmInFt,
  km: cmInKm,
  m: cmInM,
  mi: cmInMi,
  sq: cmInSq,
};

//------------------------------------------------------------------------------
// CM to Distance Value
//------------------------------------------------------------------------------

export function cmToDistanceValue(cm: number, unit: DistanceUnit): number {
  return cm / cmIn[unit];
}

//------------------------------------------------------------------------------
// CM to Distance Imp
//------------------------------------------------------------------------------

export function cmToDistanceImp(cm: number): Distance {
  if (cm < cmInMi) return { unit: "ft", value: cm / cmInFt };
  return { unit: "mi", value: cm / cmInMi };
}

//------------------------------------------------------------------------------
// CM to Distance Met
//------------------------------------------------------------------------------

export function cmToDistanceMet(cm: number): Distance {
  if (cm < cmInM) return { unit: "cm", value: cm };
  if (cm < cmInKm) return { unit: "m", value: cm / cmInM };
  return { unit: "km", value: cm / cmInKm };
}

//------------------------------------------------------------------------------
// Distance to CM
//------------------------------------------------------------------------------

export function distanceToCm(distance: Distance): number {
  return cmIn[distance.unit] * distance.value;
}

//------------------------------------------------------------------------------
// Use Distance Unit Options
//------------------------------------------------------------------------------

export function useDistanceUnitOptions(format: "long" | "short" = "short") {
  const { t } = useI18nLangContext(i18nContext);

  return useMemo(() => {
    return distanceUnitOptions.map((unit) => ({
      label: t(`${unit}.unit.${format}`),
      value: unit,
    }));
  }, [format, t]);
}

//------------------------------------------------------------------------------
// Use Format CM
//------------------------------------------------------------------------------

export function useFormatCm() {
  const { tpi } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  return useCallback(
    (cm: number, format: "long" | "short") => {
      const { unit, value } =
        system === "metric" ? cmToDistanceMet(cm) : cmToDistanceImp(cm);
      return tpi(`${unit}.${format}`, value, `${value}`);
    },
    [system, tpi],
  );
}

//------------------------------------------------------------------------------
// Use Format CM With Unit
//------------------------------------------------------------------------------

export function useFormatCmWithUnit(unit: DistanceUnit) {
  const { tpi } = useI18nLangContext(i18nContext);

  return useCallback(
    (cm: number, format: "long" | "short" = "short") => {
      const value = cm / cmIn[unit];
      return tpi(`${unit}.${format}`, value, `${value}`);
    },
    [tpi, unit],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "cm.unit.long": { en: "Centimeters", it: "Centimetri" },
  "ft.unit.long": { en: "Feet", it: "Piedi" },
  "km.unit.long": { en: "Kilometers", it: "Chilometri" },
  "m.unit.long": { en: "Meters", it: "Metri" },
  "mi.unit.long": { en: "Miles", it: "Miglia" },
  "sq.unit.long": { en: "Squares", it: "Quadretti" },

  "cm.unit.short": { en: "cm", it: "cm" },
  "ft.unit.short": { en: "ft", it: "ft" },
  "km.unit.short": { en: "km", it: "km" },
  "m.unit.short": { en: "m", it: "m" },
  "mi.unit.short": { en: "mi", it: "mi" },
  "sq.unit.short": { en: "sq", it: "q" },

  "cm.long/*": { en: "<1> centimeters", it: "<1> centimetri" },
  "cm.long/1": { en: "<1> centimeter", it: "<1> centimetro" },
  "ft.long/*": { en: "<1> feet", it: "<1> piedi" },
  "ft.long/1": { en: "<1> foot", it: "<1> piede" },
  "km.long/*": { en: "<1> kilometers", it: "<1> chilometri" },
  "km.long/1": { en: "<1> kilometer", it: "<1> chilometro" },
  "m.long/*": { en: "<1> meters", it: "<1> metri" },
  "m.long/1": { en: "<1> meter", it: "<1> metro" },
  "mi.long/*": { en: "<1> miles", it: "<1> miglia" },
  "mi.long/1": { en: "<1> mile", it: "<1> miglio" },
  "sq.long/*": { en: "<1> squares", it: "<1> quadretti" },
  "sq.long/1": { en: "<1> square", it: "<1> quadretto" },

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
  "sq.short/*": { en: "<1> sq", it: "<1> sq" },
  "sq.short/1": { en: "<1> q", it: "<1> q" },
};
