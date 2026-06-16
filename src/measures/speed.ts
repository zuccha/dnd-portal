import { useCallback, useMemo } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useI18nSystem } from "~/i18n/i18n-system";
import { formatNumber } from "~/utils/number";

//------------------------------------------------------------------------------
// Speed Unit
//------------------------------------------------------------------------------

export const speedUnitSchema = z.enum(["kmh", "mph"]);

export type SpeedUnit = z.infer<typeof speedUnitSchema>;

export const speedUnitOptions = speedUnitSchema.options;

//------------------------------------------------------------------------------
// Speed
//------------------------------------------------------------------------------

export const speedSchema = z.object({
  unit: speedUnitSchema,
  value: z.number(),
});

export type Speed = z.infer<typeof speedSchema>;

//------------------------------------------------------------------------------
// Conversions
//------------------------------------------------------------------------------

const cmhInKmh = 100_000;
const cmhInMph = 150_000;

const cmhIn = {
  cmh: 1,
  kmh: cmhInKmh,
  mph: cmhInMph,
};

//------------------------------------------------------------------------------
// Cmh to Speed Value
//------------------------------------------------------------------------------

export function cmhToSpeedValue(kmh: number, unit: SpeedUnit): number {
  return kmh / cmhIn[unit];
}

//------------------------------------------------------------------------------
// Cmh to Speed Imp
//------------------------------------------------------------------------------

export function cmhToSpeedImp(cmh: number): Speed {
  return { unit: "mph", value: cmh / cmhInMph };
}

//------------------------------------------------------------------------------
// Cmh to Speed Met
//------------------------------------------------------------------------------

export function cmhToSpeedMet(cmh: number): Speed {
  return { unit: "kmh", value: cmh / cmhInKmh };
}

//------------------------------------------------------------------------------
// Speed to Cmh
//------------------------------------------------------------------------------

export function speedToCmh(speed: Speed): number {
  return Math.round(cmhIn[speed.unit] * speed.value);
}

//------------------------------------------------------------------------------
// Use Speed Unit Options
//------------------------------------------------------------------------------

export function useSpeedUnitOptions(format: "long" | "short" = "short") {
  const { t } = useI18nLangContext(i18nContext);

  return useMemo(() => {
    return speedUnitOptions.map((unit) => ({
      label: t(`${unit}.unit.${format}`),
      value: unit,
    }));
  }, [format, t]);
}

//------------------------------------------------------------------------------
// Use Format Cmh
//------------------------------------------------------------------------------

export function useFormatCmh() {
  const { lang, tpi } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  return useCallback(
    (cmh: number, format: "long" | "short" = "short") => {
      const { unit, value } =
        system === "metric" ? cmhToSpeedMet(cmh) : cmhToSpeedImp(cmh);
      return tpi(`${unit}.${format}`, value, formatNumber(value, lang));
    },
    [lang, system, tpi],
  );
}

//------------------------------------------------------------------------------
// Use Format Cmh With Unit
//------------------------------------------------------------------------------

export function useFormatCmhWithUnit(unit: SpeedUnit) {
  const { lang, tpi } = useI18nLangContext(i18nContext);

  return useCallback(
    (cmh: number, format: "long" | "short" = "short") => {
      const value = cmh / cmhIn[unit];
      return tpi(`${unit}.${format}`, value, formatNumber(value, lang));
    },
    [lang, tpi, unit],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "cmh.unit.long": { en: "cm/h", it: "cm/h" },
  "kmh.unit.long": { en: "km/h", it: "km/h" },
  "mph.unit.long": { en: "mph", it: "mph" },

  "cmh.unit.short": { en: "cm/h", it: "cm/h" },
  "kmh.unit.short": { en: "km/h", it: "km/h" },
  "mph.unit.short": { en: "mph", it: "mph" },

  "cmh.long/*": { en: "<1> cm/h", it: "<1> cm/h" },
  "cmh.long/1": { en: "<1> cm/h", it: "<1> cm/h" },
  "kmh.long/*": { en: "<1> km/h", it: "<1> km/h" },
  "kmh.long/1": { en: "<1> km/h", it: "<1> km/h" },
  "mph.long/*": { en: "<1> mph", it: "<1> mph" },
  "mph.long/1": { en: "<1> mph", it: "<1> mph" },

  "cmh.short/*": { en: "<1> cm/h", it: "<1> cm/h" },
  "cmh.short/1": { en: "<1> cm/h", it: "<1> cm/h" },
  "kmh.short/*": { en: "<1> km/h", it: "<1> km/h" },
  "kmh.short/1": { en: "<1> km/h", it: "<1> km/h" },
  "mph.short/*": { en: "<1> mph", it: "<1> mph" },
  "mph.short/1": { en: "<1> mph", it: "<1> mph" },
};
