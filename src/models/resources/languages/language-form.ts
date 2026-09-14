import z from "zod";
import { createForm } from "~/utils/form";
import { languageRaritySchema } from "../../types/language-rarity";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Language } from "./language";

//------------------------------------------------------------------------------
// Language Form Data
//------------------------------------------------------------------------------

export const languageFormDataSchema = resourceFormDataSchema.extend({
  origin: z.string().default(""),
  rarity: languageRaritySchema.default("standard"),
});

export type LanguageFormData = z.infer<typeof languageFormDataSchema>;

//------------------------------------------------------------------------------
// Language Form Data To Resource
//------------------------------------------------------------------------------

export function languageFormDataToResource(
  data: Partial<LanguageFormData>,
  lang: string,
): Partial<Language> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    origin: createResourceFormDataI18nValue(data.origin, lang),
    rarity: data.rarity,
  });
}

//------------------------------------------------------------------------------
// Language Form
//------------------------------------------------------------------------------

export const languageForm = createForm("language", languageFormDataSchema.parse);
