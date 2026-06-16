import z from "zod";
import { serviceCategorySchema } from "~/models/types/service-category";
import { serviceCostPeriodSchema } from "~/models/types/service-cost-period";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Service
//------------------------------------------------------------------------------

export const dbServiceSchema = dbResourceSchema.extend({
  category: serviceCategorySchema,
  cost: z.number(),
  cost_period: serviceCostPeriodSchema,
});

export type DBService = z.infer<typeof dbServiceSchema>;

//------------------------------------------------------------------------------
// DB Service Translation
//------------------------------------------------------------------------------

export const dbServiceTranslationSchema = dbResourceTranslationSchema.extend({
  availability: z.string().nullish(),
  description: z.string(),
});

export type DBServiceTranslation = z.infer<typeof dbServiceTranslationSchema>;
