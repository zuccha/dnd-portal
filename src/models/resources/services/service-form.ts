import z from "zod";
import { serviceCategorySchema } from "~/models/types/service-category";
import { serviceCostPeriodSchema } from "~/models/types/service-cost-period";
import { createForm } from "~/utils/form";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Service } from "./service";

//------------------------------------------------------------------------------
// Service Form Data
//------------------------------------------------------------------------------

export const serviceFormDataSchema = resourceFormDataSchema.extend({
  availability: z.string().default(""),
  category: serviceCategorySchema.default("lifestyle"),
  cost: z.number().int().min(0).default(0),
  cost_period: serviceCostPeriodSchema.default("once"),
  description: z.string().default(""),
  name: z.string().default(""),
  page: z.number().default(0),
});

export type ServiceFormData = z.infer<typeof serviceFormDataSchema>;

//------------------------------------------------------------------------------
// Service Form Data To Resource
//------------------------------------------------------------------------------

export function serviceFormDataToResource(
  data: Partial<ServiceFormData>,
  lang: string,
): Partial<Service> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    availability: createResourceFormDataI18nValue(data.availability, lang),
    category: data.category,
    cost: data.cost,
    cost_period: data.cost_period,
    description: createResourceFormDataI18nValue(data.description, lang),
  });
}

//------------------------------------------------------------------------------
// Service Form
//------------------------------------------------------------------------------

export const serviceForm = createForm("service", serviceFormDataSchema.parse);
