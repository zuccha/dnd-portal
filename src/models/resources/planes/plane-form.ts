import z from "zod";
import { createForm } from "~/utils/form";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { planeCategorySchema } from "../../types/plane-category";
import {
  createResourceFormDataPatch,
  resourceFormDataSchema,
  resourceFormDataToResource,
} from "../resource-form";
import type { Plane } from "./plane";

//------------------------------------------------------------------------------
// Plane Form Data
//------------------------------------------------------------------------------

export const planeFormDataSchema = resourceFormDataSchema.extend({
  alignments: z.array(creatureAlignmentSchema).default([]),
  category: planeCategorySchema.default("material"),
});

export type PlaneFormData = z.infer<typeof planeFormDataSchema>;

//------------------------------------------------------------------------------
// Plane Form Data To Resource
//------------------------------------------------------------------------------

export function planeFormDataToResource(
  data: Partial<PlaneFormData>,
  lang: string,
): Partial<Plane> {
  return createResourceFormDataPatch({
    ...resourceFormDataToResource(data, lang),
    alignments: data.alignments,
    category: data.category,
  });
}

//------------------------------------------------------------------------------
// Plane Form
//------------------------------------------------------------------------------

export const planeForm = createForm("plane", planeFormDataSchema.parse);
