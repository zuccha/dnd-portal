import z from "zod";
import { i18nStringSchema } from "~/i18n/i18n-string";
import { placeTypeSchema } from "../../types/place-type";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Place
//------------------------------------------------------------------------------

export const placeSchema = resourceSchema.extend({
  description: i18nStringSchema,
  kind: z.literal("place"),
  part_of_id: z.uuid().nullable().default(null),
  part_of_kind: z.enum(["plane", "place"]).nullable().default(null),
  type: placeTypeSchema,
});

//------------------------------------------------------------------------------
// Place Type
//------------------------------------------------------------------------------

export type Place = z.infer<typeof placeSchema>;

//------------------------------------------------------------------------------
// Default Place
//------------------------------------------------------------------------------

export const defaultPlace: Place = {
  ...defaultResource,
  kind: "place",
  description: {},
  part_of_id: null,
  part_of_kind: null,
  type: "city",
};

//------------------------------------------------------------------------------
// Place Translation Fields
//------------------------------------------------------------------------------

export const placeTranslationFields: TranslationFields<Place>[] = [
  ...resourceTranslationFields,
  "description",
];
