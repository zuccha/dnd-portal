import z from "zod";
import { serviceCategorySchema } from "~/models/types/service-category";
import { serviceCostPeriodSchema } from "~/models/types/service-cost-period";
import { createForm } from "~/utils/form";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import { type DBService, type DBServiceTranslation } from "./db-service";

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
// Service Form Data To DB
//------------------------------------------------------------------------------

export function serviceFormDataToDB(data: Partial<ServiceFormData>): {
  resource: Partial<DBService>;
  translation: Partial<DBServiceTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      category: data.category,
      cost: data.cost,
      cost_period: data.cost_period,
    },
    translation: {
      ...translation,
      availability: data.availability,
      description: data.description,
    },
  };
}

//------------------------------------------------------------------------------
// Service Form
//------------------------------------------------------------------------------

export const serviceForm = createForm("service", serviceFormDataSchema.parse);
