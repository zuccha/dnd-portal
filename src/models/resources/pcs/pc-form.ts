import z from "zod";
import { chronicleDateSchema } from "~/models/other/chronicle-date";
import { createForm } from "~/utils/form";
import { pcStatusSchema } from "../../types/pc-status";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Pc } from "./pc";

//------------------------------------------------------------------------------
// PC Form Data
//------------------------------------------------------------------------------

export const pcFormDataSchema = resourceFormDataSchema.extend({
  class_ids: z.array(z.uuid()).default([]),
  date_of_birth: chronicleDateSchema.nullable().default(null),
  date_of_death: chronicleDateSchema.nullable().default(null),
  description: z.string().default(""),
  level: z.number().int().default(1),
  species_id: z.uuid().nullable().default(null),
  status: pcStatusSchema.default("active"),
});

//------------------------------------------------------------------------------
// PC Form Data Type
//------------------------------------------------------------------------------

export type PcFormData = z.infer<typeof pcFormDataSchema>;

//------------------------------------------------------------------------------
// PC Form Data To Resource
//------------------------------------------------------------------------------

export function pcFormDataToResource(data: Partial<PcFormData>, lang: string): Partial<Pc> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    class_ids: data.class_ids,
    date_of_birth: data.date_of_birth,
    date_of_death: data.date_of_death,
    description: createResourceFormDataI18nValue(data.description, lang),
    level: data.level,
    species_id: data.species_id,
    status: data.status,
  });
}

//------------------------------------------------------------------------------
// PC Form
//------------------------------------------------------------------------------

export const pcForm = createForm("pc", pcFormDataSchema.parse);
