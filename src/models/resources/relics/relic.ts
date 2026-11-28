import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { relicTypeSchema } from "../../types/relic-type";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Relic
//------------------------------------------------------------------------------

export const relicSchema = resourceSchema.extend({
  description: i18nStringSchema,
  equipment_id: z.uuid().nullable().default(null),
  kind: z.literal("relic"),
  type: relicTypeSchema,
});

//------------------------------------------------------------------------------
// Relic Type
//------------------------------------------------------------------------------

export type Relic = z.infer<typeof relicSchema>;

//------------------------------------------------------------------------------
// Default Relic
//------------------------------------------------------------------------------

export const defaultRelic: Relic = {
  ...defaultResource,
  description: {},
  equipment_id: null,
  kind: "relic",
  type: "artifact",
};

//------------------------------------------------------------------------------
// Relic Translation Fields
//------------------------------------------------------------------------------

export const relicTranslationFields: TranslationFields<Relic>[] = [
  ...resourceTranslationFields,
  "description",
];
