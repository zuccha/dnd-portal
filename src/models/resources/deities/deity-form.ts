import z from "zod";
import { createForm } from "~/utils/form";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { deityDomainSchema } from "../../types/deity-domain";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Deity } from "./deity";

//------------------------------------------------------------------------------
// Deity Form Data
//------------------------------------------------------------------------------

export const deityFormDataSchema = resourceFormDataSchema.extend({
  alignment: creatureAlignmentSchema.default("any"),
  description: z.string().default(""),
  domain: deityDomainSchema.default("none"),
  epithet: z.string().default(""),
});

//------------------------------------------------------------------------------
// Deity Form Data Type
//------------------------------------------------------------------------------

export type DeityFormData = z.infer<typeof deityFormDataSchema>;

//------------------------------------------------------------------------------
// Deity Form Data To Resource
//------------------------------------------------------------------------------

export function deityFormDataToResource(
  data: Partial<DeityFormData>,
  lang: string,
): Partial<Deity> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    alignment: data.alignment,
    description: createResourceFormDataI18nValue(data.description, lang),
    domain: data.domain,
    epithet: createResourceFormDataI18nValue(data.epithet, lang),
  });
}

//------------------------------------------------------------------------------
// Deity Form
//------------------------------------------------------------------------------

export const deityForm = createForm("deity", deityFormDataSchema.parse);
