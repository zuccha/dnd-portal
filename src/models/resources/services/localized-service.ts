import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useTranslateServiceCategory } from "~/models/types/service-category";
import { useI18nSystem } from "../../../i18n/i18n-system";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Service, serviceSchema } from "./service";

//------------------------------------------------------------------------------
// Localized Service
//------------------------------------------------------------------------------

export const localizedServiceSchema = localizedResourceSchema(
  serviceSchema,
  z.literal("service"),
).extend({
  availability: localizedFieldSchema,
  category: localizedFieldSchema,
  cost: z.string(),
  price: localizedFieldSchema,
});

export type LocalizedService = z.infer<typeof localizedServiceSchema>;

//------------------------------------------------------------------------------
// Service Localization Context
//------------------------------------------------------------------------------

type ServiceLocalizationContext = ResourceLocalizationContext & {
  formatCost: ReturnType<typeof useFormatCp>;
  system: ReturnType<typeof useI18nSystem>[0];
  translateCategory: (value: Service["category"]) => string;
};

//------------------------------------------------------------------------------
// Use Service Localization Context
//------------------------------------------------------------------------------

export function useServiceLocalizationContext(_service: Service): ServiceLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const [system] = useI18nSystem();
  const formatCost = useFormatCp();
  const translateCategory = useTranslateServiceCategory(context.lang);

  return useMemo(
    () => ({ ...context, formatCost, system, translateCategory }),
    [context, formatCost, system, translateCategory],
  );
}

//------------------------------------------------------------------------------
// Localize Service
//------------------------------------------------------------------------------

export function localizeService(
  service: Service,
  context: ServiceLocalizationContext,
): LocalizedService {
  const availability = translate(service.availability, context.lang);
  const category = context.translateCategory(service.category);
  const cost = context.formatCost(service.cost);
  const price =
    service.cost_period === "once"
      ? cost
      : service.cost_period === "distance"
        ? context.system === "metric"
          ? context.ti("price.distance.met", cost)
          : context.ti("price.distance.imp", cost)
        : context.ti(`price.${service.cost_period}`, cost);

  return {
    ...localizeResource(service, context),
    descriptor: category,
    details: translate(service.description, context.lang),
    availability: { label: context.t("availability"), value: availability },
    category: { label: context.t("category"), value: category },
    cost,
    price: { label: context.t("price"), value: price },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "category": {
    en: "Category",
    it: "Categoria",
  },
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
