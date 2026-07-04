import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useTranslateServiceCategory } from "~/models/types/service-category";
import { useTranslateServiceCostPeriod } from "~/models/types/service-cost-period";
import { useI18nSystem } from "../../../i18n/i18n-system";
import {
  formatInfo,
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Service, serviceSchema } from "./service";

//------------------------------------------------------------------------------
// Localized Service
//------------------------------------------------------------------------------

export const localizedServiceSchema = localizedResourceSchema(
  serviceSchema,
  z.literal("service"),
).extend({
  availability: z.string(),
  category: z.string(),
  cost: z.string(),
  cost_period: z.string(),
  info: z.string(),
  price: z.string(),
});

export type LocalizedService = z.infer<typeof localizedServiceSchema>;

//------------------------------------------------------------------------------
// Use Localized Service
//------------------------------------------------------------------------------

export function useLocalizeService(): (service: Service) => LocalizedService {
  const localizeResource = useLocalizeResource<Service>();
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();
  const formatCost = useFormatCp();
  const translateCategory = useTranslateServiceCategory(lang);
  const translateCostPeriod = useTranslateServiceCostPeriod(lang);

  return useCallback(
    (service: Service): LocalizedService => {
      const availability = translate(service.availability, lang);
      const category = translateCategory(service.category).label;
      const cost = formatCost(service.cost);
      const costPeriod = translateCostPeriod(service.cost_period).label;
      const price =
        service.cost_period === "once" ? cost
        : service.cost_period === "distance" ?
          system === "metric" ?
            ti(`price.distance.met`, cost)
          : ti(`price.distance.imp`, cost)
        : ti(`price.${service.cost_period}`, cost);

      return {
        ...localizeResource(service),
        descriptor: category,
        details: translate(service.description, lang),

        availability,
        category,
        cost,
        cost_period: costPeriod,
        info: formatInfo([[t("availability"), availability]]),
        price,
      };
    },
    [
      formatCost,
      lang,
      localizeResource,
      system,
      t,
      ti,
      translateCategory,
      translateCostPeriod,
    ],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "availability": {
    en: "Availability",
    it: "Disponibilità",
  },
  "price": {
    en: "Price",
    it: "Prezzo",
  },
  "price.day": {
    en: "<1> / day",
    it: "<1> / giorno",
  },
  "price.distance.imp": {
    en: "<1> / mile",
    it: "<1> / miglio",
  },
  "price.distance.met": {
    en: "<1> / 1.5 km",
    it: "<1> / 1.5 km",
  },
  "price.hour": {
    en: "<1>/hour",
    it: "<1>/ora",
  },
  "price.spell": {
    en: "<1> / spell",
    it: "<1> / incantesimo",
  },
};
