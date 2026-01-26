import z from "zod";
import { campaignRoleSchema } from "../types/campaign-role";
import type { DBResource, DBResourceTranslation } from "./db-resource";

//------------------------------------------------------------------------------
// Resource Form Data
//------------------------------------------------------------------------------

export const resourceFormDataSchema = z.object({
  name: z.string(),
  name_short: z.string(),
  page: z.number(),
  visibility: campaignRoleSchema,
});

export type ResourceFormData = z.infer<typeof resourceFormDataSchema>;

//------------------------------------------------------------------------------
// Resource Form Data To DB
//------------------------------------------------------------------------------

export function resourceFormDataToDB(data: Partial<ResourceFormData>): {
  resource: Partial<DBResource>;
  translation: Partial<DBResourceTranslation>;
} {
  return {
    resource: {
      visibility: data.visibility,
    },
    translation: {
      name: data.name,
      name_short: data.name_short,
      page: data.page || null,
    },
  };
}
