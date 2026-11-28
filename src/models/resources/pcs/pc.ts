import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { chronicleDateSchema } from "~/models/other/chronicle-date";
import { pcStatusSchema } from "../../types/pc-status";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// PC
//------------------------------------------------------------------------------

export const pcSchema = resourceSchema.extend({
  class_ids: z.array(z.uuid()).default([]),
  date_of_birth: chronicleDateSchema.nullable().default(null),
  date_of_death: chronicleDateSchema.nullable().default(null),
  description: i18nStringSchema,
  kind: z.literal("pc"),
  level: z.number().int().default(1),
  species_id: z.uuid().nullable().default(null),
  status: pcStatusSchema.default("active"),
});

//------------------------------------------------------------------------------
// PC Type
//------------------------------------------------------------------------------

export type Pc = z.infer<typeof pcSchema>;

//------------------------------------------------------------------------------
// Default PC
//------------------------------------------------------------------------------

export const defaultPc: Pc = {
  ...defaultResource,
  class_ids: [],
  date_of_birth: null,
  date_of_death: null,
  description: {},
  kind: "pc",
  level: 1,
  species_id: null,
  status: "active",
};

//------------------------------------------------------------------------------
// PC Translation Fields
//------------------------------------------------------------------------------

export const pcTranslationFields: TranslationFields<Pc>[] = [
  ...resourceTranslationFields,
  "description",
];
