import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { serviceCategorySchema } from "~/models/types/service-category";
import { serviceCostPeriodSchema } from "~/models/types/service-cost-period";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Service
//------------------------------------------------------------------------------

export const serviceSchema = resourceSchema.extend({
  availability: i18nStringSchema,
  category: serviceCategorySchema,
  cost: z.number(),
  cost_period: serviceCostPeriodSchema,
  description: i18nStringSchema,
});

export type Service = z.infer<typeof serviceSchema>;

//------------------------------------------------------------------------------
// Default Service
//------------------------------------------------------------------------------

export const defaultService: Service = {
  ...defaultResource,
  availability: {},
  category: "lifestyle",
  cost: 0,
  cost_period: "once",
  description: {},
};

//------------------------------------------------------------------------------
// Service Translation Fields
//------------------------------------------------------------------------------

export const serviceTranslationFields: TranslationFields<Service>[] = [
  ...resourceTranslationFields,
  "availability",
  "description",
];
