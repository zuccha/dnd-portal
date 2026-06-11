import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Metamagic
//------------------------------------------------------------------------------

export const metamagicSchema = resourceSchema.extend({
  description: i18nStringSchema,
  prerequisite: i18nStringSchema,
  sorcery_points: z.number().int().min(0),
});

export type Metamagic = z.infer<typeof metamagicSchema>;

//------------------------------------------------------------------------------
// Default Metamagic
//------------------------------------------------------------------------------

export const defaultMetamagic: Metamagic = {
  ...defaultResource,
  description: {},
  prerequisite: {},
  sorcery_points: 1,
};

//------------------------------------------------------------------------------
// Metamagic Translation Fields
//------------------------------------------------------------------------------

export const metamagicTranslationFields: TranslationFields<Metamagic>[] = [
  ...resourceTranslationFields,
  "description",
  "prerequisite",
];
