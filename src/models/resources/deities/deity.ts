import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { deityDomainSchema } from "../../types/deity-domain";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Deity
//------------------------------------------------------------------------------

export const deitySchema = resourceSchema.extend({
  alignment: creatureAlignmentSchema,
  description: i18nStringSchema,
  domain: deityDomainSchema,
  epithet: i18nStringSchema.default({}),
  kind: z.literal("deity"),
});

//------------------------------------------------------------------------------
// Deity Type
//------------------------------------------------------------------------------

export type Deity = z.infer<typeof deitySchema>;

//------------------------------------------------------------------------------
// Default Deity
//------------------------------------------------------------------------------

export const defaultDeity: Deity = {
  ...defaultResource,
  alignment: "any",
  description: {},
  domain: "none",
  epithet: {},
  kind: "deity",
};

//------------------------------------------------------------------------------
// Deity Translation Fields
//------------------------------------------------------------------------------

export const deityTranslationFields: TranslationFields<Deity>[] = [
  ...resourceTranslationFields,
  "description",
  "epithet",
];
