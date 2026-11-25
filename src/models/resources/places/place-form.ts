import z from "zod";
import { createForm } from "~/utils/form";
import { placeTypeSchema } from "../../types/place-type";
import {
  createResourceFormDataI18nValue,
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Place } from "./place";

//------------------------------------------------------------------------------
// Place Form Data
//------------------------------------------------------------------------------

export const placeFormDataSchema = resourceFormDataSchema.extend({
  description: z.string().default(""),
  part_of_id: z.uuid().nullable().default(null),
  part_of_kind: z.enum(["nothing", "plane", "place"]).default("nothing"),
  type: placeTypeSchema.default("other"),
});

//------------------------------------------------------------------------------
// Place Form Data Type
//------------------------------------------------------------------------------

export type PlaceFormData = z.infer<typeof placeFormDataSchema>;

//------------------------------------------------------------------------------
// Place Form Data To Resource
//------------------------------------------------------------------------------

export function placeFormDataToResource(
  data: Partial<PlaceFormData>,
  lang: string,
): Partial<Place> {
  const { part_of_id, part_of_kind, ...formData } = data;
  const hasPartOf = part_of_id && part_of_kind && part_of_kind !== "nothing";
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(formData, lang),
    description: createResourceFormDataI18nValue(formData.description, lang),
    part_of_id: hasPartOf ? part_of_id : null,
    part_of_kind: hasPartOf ? part_of_kind : null,
    type: formData.type,
  });
}

//------------------------------------------------------------------------------
// Place Form
//------------------------------------------------------------------------------

export const placeForm = createForm("place", placeFormDataSchema.parse);
