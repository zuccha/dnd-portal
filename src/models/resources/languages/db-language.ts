import z from "zod";
import { languageRaritySchema } from "../../types/language-rarity";
import { dbResourceSchema, dbResourceTranslationSchema } from "../db-resource";

//------------------------------------------------------------------------------
// DB Language
//------------------------------------------------------------------------------

export const dbLanguageSchema = dbResourceSchema.extend({
  rarity: languageRaritySchema,
});

export type DBLanguage = z.infer<typeof dbLanguageSchema>;

//------------------------------------------------------------------------------
// DB Language Translation
//------------------------------------------------------------------------------

export const dbLanguageTranslationSchema = dbResourceTranslationSchema.extend({
  origin: z.string(),
});

export type DBLanguageTranslation = z.infer<typeof dbLanguageTranslationSchema>;
