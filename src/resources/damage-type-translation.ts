import { z } from "zod";
import { damageTypeSchema, damageTypes } from "./damage-type";
import { createTypeTranslation } from "./type-translation";

//------------------------------------------------------------------------------
// Damage Type Translation
//------------------------------------------------------------------------------

export const damageTypeTranslationSchema = z.object({
  damage_type: damageTypeSchema,
  label: z.string().default(""),
  lang: z.string().default("en"),
});

export type damageTypeTranslation = z.infer<typeof damageTypeTranslationSchema>;

//------------------------------------------------------------------------------
// Hooks
//------------------------------------------------------------------------------

export const {
  useTranslate: useTranslateDamageType,
  useTranslations: useDamageTypeTranslations,
} = createTypeTranslation(
  "damage_type",
  damageTypes,
  damageTypeTranslationSchema
);
