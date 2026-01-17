import { useCallback, useMemo } from "react";
import z from "zod";
import { formatNumber } from "~/utils/number";
import { useI18nLangContext } from "../i18n/i18n-lang-context";

//------------------------------------------------------------------------------
// Cost Unit
//------------------------------------------------------------------------------

export const costUnitSchema = z.enum(["cp", "sp", /* "ep", */ "gp" /* "pp" */]);

export type CostUnit = z.infer<typeof costUnitSchema>;

export const costUnitOptions = costUnitSchema.options;

//------------------------------------------------------------------------------
// Cost
//------------------------------------------------------------------------------

export const costSchema = z.object({
  unit: costUnitSchema,
  value: z.number(),
});

export type Cost = z.infer<typeof costSchema>;

//------------------------------------------------------------------------------
// Conversions
//------------------------------------------------------------------------------

const cpInSp = 10;
const cpInEp = 50;
const cpInGp = 100;
const cpInPp = 1000;

const cpIn = {
  cp: 1,
  ep: cpInEp,
  gp: cpInGp,
  pp: cpInPp,
  sp: cpInSp,
};

//------------------------------------------------------------------------------
// CP to Cost Value
//------------------------------------------------------------------------------

export function cpToCostValue(cp: number, unit: CostUnit): number {
  return cp / cpIn[unit];
}

//------------------------------------------------------------------------------
// CP to Cost
//------------------------------------------------------------------------------

export function cpToCost(cp: number): Cost {
  if (cp < cpInSp) return { unit: "cp", value: cp };
  if (cp < cpInGp) return { unit: "sp", value: cp / cpInSp };
  // if (cp < cpInGp) return { unit: "ep", value: cp / cpInEp };
  return { unit: "gp", value: cp / cpInGp };
  // if (cp < cpInPp) return { unit: "gp", value: cp / cpInGp };
  // return { unit: "pp", value: cp / cpInPp };
}

//------------------------------------------------------------------------------
// Cost to CP
//------------------------------------------------------------------------------

export function costToCp(cost: Cost): number {
  return cpIn[cost.unit] * cost.value;
}

//------------------------------------------------------------------------------
// Use Cost Unit Options
//------------------------------------------------------------------------------

export function useCostUnitOptions(format: "long" | "short" = "short") {
  const { t } = useI18nLangContext(i18nContext);

  return useMemo(() => {
    return costUnitOptions.map((unit) => ({
      label: t(`${unit}.unit.${format}`),
      value: unit,
    }));
  }, [format, t]);
}

//------------------------------------------------------------------------------
// Use Format CP
//------------------------------------------------------------------------------

export function useFormatCp() {
  const { lang, tpi } = useI18nLangContext(i18nContext);

  return useCallback(
    (cp: number, format: "long" | "short" = "short") => {
      const { unit, value } = cpToCost(cp);
      return tpi(`${unit}.${format}`, value, formatNumber(value, lang));
    },
    [lang, tpi],
  );
}

//------------------------------------------------------------------------------
// Use Format CP With Unit
//------------------------------------------------------------------------------

export function useFormatCpWithUnit(unit: CostUnit) {
  const { lang, tpi } = useI18nLangContext(i18nContext);

  return useCallback(
    (cp: number, format: "long" | "short" = "short") => {
      const value = cp / cpIn[unit];
      return tpi(`${unit}.${format}`, value, formatNumber(value, lang));
    },
    [lang, tpi, unit],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "cp.unit.long": { en: "Copper Piece", it: "Moneta di Rame" },
  "ep.unit.long": { en: "Electrum Piece", it: "Moneta di Electrum" },
  "gp.unit.long": { en: "Gold Piece", it: "Moneta d'Oro" },
  "pp.unit.long": { en: "Platinum Piece", it: "Moneta di Platino" },
  "sp.unit.long": { en: "Silver Piece", it: "Moneta d'Argento" },

  "cp.unit.short": { en: "cp", it: "mr" },
  "ep.unit.short": { en: "ep", it: "me" },
  "gp.unit.short": { en: "gp", it: "mo" },
  "pp.unit.short": { en: "pp", it: "mp" },
  "sp.unit.short": { en: "sp", it: "ma" },

  "cp.long/*": { en: "<1> copper pieces", it: "<1> monete di rame" },
  "cp.long/1": { en: "<1> copper piece", it: "<1> moneta di rame" },
  "ep.long/*": { en: "<1> electrum pieces", it: "<1> monete di electrum" },
  "ep.long/1": { en: "<1> electrum piece", it: "<1> moneta di electrum" },
  "gp.long/*": { en: "<1> gold pieces", it: "<1> monete d'oro" },
  "gp.long/1": { en: "<1> gold piece", it: "<1> moneta d'oro" },
  "pp.long/*": { en: "<1> platinum pieces", it: "<1> monete di platino" },
  "pp.long/1": { en: "<1> platinum piece", it: "<1> moneta di platino" },
  "sp.long/*": { en: "<1> silver pieces", it: "<1> monete d'argento" },
  "sp.long/1": { en: "<1> silver piece", it: "<1> moneta d'argento" },

  "cp.short/*": { en: "<1> cp", it: "<1> mr" },
  "cp.short/1": { en: "<1> cp", it: "<1> mr" },
  "ep.short/*": { en: "<1> ep", it: "<1> me" },
  "ep.short/1": { en: "<1> ep", it: "<1> me" },
  "gp.short/*": { en: "<1> gp", it: "<1> mo" },
  "gp.short/1": { en: "<1> gp", it: "<1> mo" },
  "pp.short/*": { en: "<1> pp", it: "<1> mp" },
  "pp.short/1": { en: "<1> pp", it: "<1> mp" },
  "sp.short/*": { en: "<1> sp", it: "<1> ma" },
  "sp.short/1": { en: "<1> sp", it: "<1> ma" },
};
