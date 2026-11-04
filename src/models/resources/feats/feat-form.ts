import z from "zod";
import { createForm } from "~/utils/form";
import { characterLevelSchema } from "../../types/character-level";
import { featCategorySchema } from "../../types/feat-category";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { ResourceFormOutput } from "../resource-form";
import type { Feat } from "./feat";

//------------------------------------------------------------------------------
// Feat Form Data
//------------------------------------------------------------------------------

export const featFormDataSchema = resourceFormDataSchema.extend({
  category: featCategorySchema.default("general"),
  description: z.string().default(""),
  is_repeatable: z.boolean().default(false),
  minimum_level: characterLevelSchema.default(0),
  prerequisite: z.string().default(""),
});

export type FeatFormData = z.infer<typeof featFormDataSchema>;

//------------------------------------------------------------------------------
// Feat Form Data To Resource
//------------------------------------------------------------------------------

export function featFormDataToResource(
  data: Partial<FeatFormData>,
  lang: string,
): ResourceFormOutput<Feat> {
  const resource = createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    category: data.category,
    description: createResourceFormDataI18nValue(data.description, lang),
    is_repeatable: data.is_repeatable,
    minimum_level: data.minimum_level,
    prerequisite: createResourceFormDataI18nValue(data.prerequisite, lang),
  });
  return { resource, relations: [] };
}

//------------------------------------------------------------------------------
// Feat Form
//------------------------------------------------------------------------------

export const featForm = createForm("feat", featFormDataSchema.parse);
