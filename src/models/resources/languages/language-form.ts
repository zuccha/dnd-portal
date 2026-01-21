import z from "zod";
import { createForm } from "~/utils/form";
import { languageRaritySchema } from "../../types/language-rarity";
import { resourceFormDataSchema, resourceFormDataToDB } from "../resource-form";
import { type DBLanguage, type DBLanguageTranslation } from "./db-language";

//------------------------------------------------------------------------------
// Language Form Data
//------------------------------------------------------------------------------

export const languageFormDataSchema = resourceFormDataSchema.extend({
  origin: z.string(),
  rarity: languageRaritySchema,
});

export type LanguageFormData = z.infer<typeof languageFormDataSchema>;

//------------------------------------------------------------------------------
// Language Form Data To DB
//------------------------------------------------------------------------------

export function languageFormDataToDB(data: Partial<LanguageFormData>): {
  resource: Partial<DBLanguage>;
  translation: Partial<DBLanguageTranslation>;
} {
  const { resource, translation } = resourceFormDataToDB(data);

  return {
    resource: {
      ...resource,
      rarity: data.rarity,
    },
    translation: {
      ...translation,
      origin: data.origin,
    },
  };
}

//------------------------------------------------------------------------------
// Language Form
//------------------------------------------------------------------------------

export const languageForm = createForm(
  "language",
  languageFormDataSchema.parse,
);
