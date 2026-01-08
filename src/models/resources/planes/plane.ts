import z from "zod";
import { creatureAlignmentSchema } from "../../types/creature-alignment";
import { planeCategorySchema } from "../../types/plane-category";
import {
  type TranslationFields,
  defaultResource,
  resourceSchema,
  resourceTranslationFields,
} from "../resource";

//------------------------------------------------------------------------------
// Plane
//------------------------------------------------------------------------------

export const planeSchema = resourceSchema.extend({
  alignments: z.array(creatureAlignmentSchema),
  category: planeCategorySchema,
});

export type Plane = z.infer<typeof planeSchema>;

//------------------------------------------------------------------------------
// Default Plane
//------------------------------------------------------------------------------

export const defaultPlane: Plane = {
  ...defaultResource,
  alignments: [],
  category: "material",
};

//------------------------------------------------------------------------------
// Plane Translation Fields
//------------------------------------------------------------------------------

export const planeTranslationFields: TranslationFields<Plane>[] = [
  ...resourceTranslationFields,
];
