import { z } from "zod";
import { useI18nSystem } from "~/i18n/i18n-system";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Service Cost Period
//------------------------------------------------------------------------------

export const serviceCostPeriodSchema = z.enum([
  "once",
  "day",
  "hour",
  "distance",
]);

export const serviceCostPeriods = serviceCostPeriodSchema.options;

export type ServiceCostPeriod = z.infer<typeof serviceCostPeriodSchema>;

//------------------------------------------------------------------------------
// Service Cost Period Translation Hooks
//------------------------------------------------------------------------------

const {
  useSortedOptions: useServiceCostPeriodOptionsImp,
  useTranslate: useTranslateServiceCostPeriodImp,
  useTranslations: useServiceCostPeriodTranslationsImp,
} = createTypeTranslationHooks(serviceCostPeriods, {
  day: { en: "Per Day", it: "Al Giorno" },
  distance: { en: "Per Mile", it: "Per Miglio" },
  hour: { en: "Per Hour", it: "All'Ora" },
  once: { en: "Once", it: "Una Tantum" },
});

const {
  useSortedOptions: useServiceCostPeriodOptionsMet,
  useTranslate: useTranslateServiceCostPeriodMet,
  useTranslations: useServiceCostPeriodTranslationsMet,
} = createTypeTranslationHooks(serviceCostPeriods, {
  day: { en: "Per Day", it: "Al Giorno" },
  distance: { en: "Per 1.5 km", it: "Per 1,5 km" },
  hour: { en: "Per Hour", it: "All'Ora" },
  once: { en: "Once", it: "Una Tantum" },
});

export function useServiceCostPeriodOptions() {
  const [system] = useI18nSystem();
  const imp = useServiceCostPeriodOptionsImp();
  const met = useServiceCostPeriodOptionsMet();
  return system === "metric" ? met : imp;
}

export function useTranslateServiceCostPeriod(lang: string) {
  const [system] = useI18nSystem();
  const imp = useTranslateServiceCostPeriodImp(lang);
  const met = useTranslateServiceCostPeriodMet(lang);
  return system === "metric" ? met : imp;
}

export function useServiceCostPeriodTranslations() {
  const [system] = useI18nSystem();
  const imp = useServiceCostPeriodTranslationsImp();
  const met = useServiceCostPeriodTranslationsMet();
  return system === "metric" ? met : imp;
}
