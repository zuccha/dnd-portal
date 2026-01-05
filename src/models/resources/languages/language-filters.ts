import z from "zod";
import { languageRaritySchema } from "../../types/language-rarity";
import {
  resourceFiltersSchema,
  resourceOrderOptions,
} from "../resource-filters";

//------------------------------------------------------------------------------
// Language Order Options
//------------------------------------------------------------------------------

export const languageOrderOptions = resourceOrderOptions;

//------------------------------------------------------------------------------
// Language Filters
//------------------------------------------------------------------------------

export const languageFiltersSchema = resourceFiltersSchema.extend({
  rarity: z
    .partialRecord(languageRaritySchema, z.boolean().optional())
    .optional(),
});

export type LanguageFilters = z.infer<typeof languageFiltersSchema>;

//------------------------------------------------------------------------------
// Default Language Filters
//------------------------------------------------------------------------------

export const defaultLanguageFilters: LanguageFilters = {
  name: "",
  order_by: "name",
  order_dir: "asc",
};
